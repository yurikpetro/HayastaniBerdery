import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { FortressTranslation } from '@prisma/client'
import type {
  AdminUser,
  AdminUserAction,
  AdminUserComment,
  AdminUserSubmission,
  BanUserDto,
  Fortress,
  PaginatedResult,
  UpdateUserRoleDto,
  UserListQuery,
  UserRole,
} from '@hayastani/shared'
import { canManageRole } from '../auth/roles.guard'
import { toLocalized } from '../mappers'
import { PrismaService } from '../prisma/prisma.service'

type Actor = { id: string; email: string; role: UserRole }

const manageableRoles: UserRole[] = ['user', 'moderator', 'admin']

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(query: UserListQuery = {}): Promise<PaginatedResult<AdminUser>> {
    const page = query.page ?? 1
    const limit = Math.min(query.limit ?? 50, 100)
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.banned != null ? { isBanned: query.banned } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' as const } },
              { name: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          bannedBy: { select: { id: true, email: true, name: true } },
          _count: { select: { comments: true, submissions: true, auditLogs: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: records.map((record) => this.mapUser(record)),
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<AdminUser> {
    const record = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bannedBy: { select: { id: true, email: true, name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { fortress: { select: { slug: true, translations: true } } },
        },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { fortress: { select: { slug: true, translations: true } } },
        },
        _count: { select: { comments: true, submissions: true, auditLogs: true } },
      },
    })
    if (!record) throw new NotFoundException('User not found')
    return this.mapUser(record)
  }

  async updateRole(id: string, dto: UpdateUserRoleDto, actor: Actor): Promise<AdminUser> {
    if (!manageableRoles.includes(dto.role)) {
      throw new BadRequestException('This role cannot be assigned from the admin UI')
    }

    const target = await this.requireManageableTarget(id, actor)
    if (!this.canAssignRole(actor.role, dto.role)) {
      throw new ForbiddenException('Cannot assign this role')
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      include: {
        bannedBy: { select: { id: true, email: true, name: true } },
        _count: { select: { comments: true, submissions: true, auditLogs: true } },
      },
    })

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'user.role_changed',
        details: {
          targetUserId: target.id,
          email: target.email,
          previousRole: target.role,
          role: updated.role,
        },
      },
    })

    return this.mapUser(updated)
  }

  async ban(id: string, dto: BanUserDto, actor: Actor): Promise<AdminUser> {
    const target = await this.requireManageableTarget(id, actor)
    if (actor.role === 'admin' && target.role !== 'user') {
      throw new ForbiddenException('Admins can ban regular users only')
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: dto.reason?.trim() || null,
        bannedById: actor.id,
      },
      include: {
        bannedBy: { select: { id: true, email: true, name: true } },
        _count: { select: { comments: true, submissions: true, auditLogs: true } },
      },
    })

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'user.banned',
        details: {
          targetUserId: target.id,
          email: target.email,
          role: target.role,
          reason: dto.reason?.trim() || null,
        },
      },
    })

    return this.mapUser(updated)
  }

  async unban(id: string, actor: Actor): Promise<AdminUser> {
    const target = await this.requireManageableTarget(id, actor)
    if (actor.role === 'admin' && target.role !== 'user') {
      throw new ForbiddenException('Admins can unban regular users only')
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedById: null,
      },
      include: {
        bannedBy: { select: { id: true, email: true, name: true } },
        _count: { select: { comments: true, submissions: true, auditLogs: true } },
      },
    })

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'user.unbanned',
        details: {
          targetUserId: target.id,
          email: target.email,
          role: target.role,
        },
      },
    })

    return this.mapUser(updated)
  }

  private async requireManageableTarget(id: string, actor: Actor) {
    const target = await this.prisma.user.findUnique({ where: { id } })
    if (!target) throw new NotFoundException('User not found')
    if (target.id === actor.id) throw new ForbiddenException('Cannot manage yourself')
    if (this.isProtectedSuperAdmin(target.email, target.role as UserRole)) {
      throw new ForbiddenException('Cannot manage the main admin account')
    }
    if (!canManageRole(actor.role, target.role as UserRole)) {
      throw new ForbiddenException('Cannot manage a user with this role')
    }
    return target
  }

  private canAssignRole(actorRole: UserRole, role: UserRole) {
    if (actorRole === 'super_admin') return role !== 'super_admin'
    if (actorRole === 'admin') return role === 'user' || role === 'moderator'
    return false
  }

  private isProtectedSuperAdmin(email: string, role: UserRole) {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    return role === 'super_admin' || Boolean(superAdminEmail && email.toLowerCase() === superAdminEmail)
  }

  private mapUser(record: {
    id: string
    email: string
    name: string
    role: string
    isBanned: boolean
    bannedAt: Date | null
    bannedReason: string | null
    bannedBy?: { id: string; email: string; name: string } | null
    createdAt: Date
    updatedAt: Date
    lastLoginAt?: Date | null
    _count?: { comments: number; submissions: number; auditLogs: number }
    comments?: Array<{
      id: string
      fortressId: string
      parentId: string | null
      body: string
      status: string
      createdAt: Date
      fortress: { slug: string; translations: FortressTranslation[] }
    }>
    submissions?: Array<{
      id: string
      status: string
      payload: unknown
      createdAt: Date
      moderatorNote: string | null
    }>
    auditLogs?: Array<{
      id: string
      action: string
      details: unknown
      createdAt: Date
      fortress?: { slug: string; translations: FortressTranslation[] } | null
    }>
  }): AdminUser {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role as UserRole,
      isBanned: record.isBanned,
      bannedAt: record.bannedAt?.toISOString(),
      bannedReason: record.bannedReason ?? undefined,
      bannedBy: record.bannedBy ?? null,
      lastLoginAt: record.lastLoginAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      commentsCount: record._count?.comments,
      submissionsCount: record._count?.submissions,
      auditLogsCount: record._count?.auditLogs,
      comments: record.comments?.map((comment): AdminUserComment => ({
        id: comment.id,
        fortressId: comment.fortressId,
        fortressSlug: comment.fortress.slug,
        fortressName: toLocalized(comment.fortress.translations, 'name'),
        parentId: comment.parentId,
        body: comment.body,
        status: comment.status as AdminUserComment['status'],
        createdAt: comment.createdAt.toISOString(),
      })),
      submissions: record.submissions?.map((submission): AdminUserSubmission => {
        const proposed = submission.payload as unknown as Fortress
        return {
          id: submission.id,
          status: submission.status.replace(/_/g, '-') as AdminUserSubmission['status'],
          proposedFortressName: proposed.name,
          proposedFortressSummary: proposed.summary,
          proposedFortressSlug: proposed.slug,
          createdAt: submission.createdAt.toISOString(),
          moderatorNote: submission.moderatorNote ?? undefined,
        }
      }),
      adminActions: record.auditLogs?.map((entry): AdminUserAction => ({
        id: entry.id,
        action: entry.action,
        fortressSlug: entry.fortress?.slug ?? null,
        fortressName: entry.fortress ? toLocalized(entry.fortress.translations, 'name') : null,
        details: entry.details,
        createdAt: entry.createdAt.toISOString(),
      })),
    }
  }
}
