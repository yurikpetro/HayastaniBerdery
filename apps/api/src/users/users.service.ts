import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type {
  AdminUser,
  BanUserDto,
  PaginatedResult,
  UpdateUserRoleDto,
  UserListQuery,
  UserRole,
} from '@hayastani/shared'
import { canManageRole } from '../auth/roles.guard'
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
    _count?: { comments: number; submissions: number; auditLogs: number }
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
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      commentsCount: record._count?.comments,
      submissionsCount: record._count?.submissions,
      auditLogsCount: record._count?.auditLogs,
    }
  }
}
