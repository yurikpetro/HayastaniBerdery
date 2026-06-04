import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { AdminComment, CommentStatus, CreateCommentDto, FortressComment } from '@hayastani/shared'
import { sanitizeCommentBody } from '../utils/commentBody'
import { mapComment } from '../mappers'
import { PrismaService } from '../prisma/prisma.service'

/** Root = 0; max 10 levels => deepest reply has depth 9 */
const MAX_COMMENT_DEPTH = 9

@Injectable()
export class CommentsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByFortress(fortressId: string): Promise<FortressComment[]> {
    const records = await this.prisma.fortressComment.findMany({
      where: { fortressId, status: 'published' },
      orderBy: { createdAt: 'asc' },
    })
    return records.map(mapComment)
  }

  async findAllForAdmin(): Promise<AdminComment[]> {
    const records = await this.prisma.fortressComment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        fortress: { select: { slug: true } },
        user: { select: { id: true, email: true } },
      },
    })

    return records.map((comment) => ({
      id: comment.id,
      fortressId: comment.fortressId,
      parentId: comment.parentId,
      author: comment.authorName,
      body: comment.body,
      status: comment.status as CommentStatus,
      createdAt: comment.createdAt.toISOString(),
      fortressSlug: comment.fortress.slug,
      userId: comment.user?.id ?? null,
      userEmail: comment.user?.email ?? null,
    }))
  }

  /** Depth of a comment: root = 0, each reply +1 */
  private async getCommentDepth(commentId: string, fortressId: string): Promise<number> {
    let depth = 0
    let currentId: string | null = commentId

    while (currentId) {
      const row: { parentId: string | null } | null = await this.prisma.fortressComment.findFirst({
        where: { id: currentId, fortressId },
        select: { parentId: true },
      })
      if (!row?.parentId) break
      depth += 1
      currentId = row.parentId
    }

    return depth
  }

  async create(
    fortressId: string,
    dto: CreateCommentDto,
    user?: { id: string; name: string },
  ): Promise<FortressComment> {
    const fortress = await this.prisma.fortress.findUnique({ where: { id: fortressId } })
    if (!fortress) throw new NotFoundException('Fortress not found')

    if (dto.parentId) {
      const parent = await this.prisma.fortressComment.findFirst({
        where: { id: dto.parentId, fortressId, status: 'published' },
      })
      if (!parent) throw new NotFoundException('Parent comment not found')

      const parentDepth = await this.getCommentDepth(dto.parentId, fortressId)
      if (parentDepth >= MAX_COMMENT_DEPTH) {
        throw new BadRequestException('Maximum reply nesting reached')
      }
    }

    const body = sanitizeCommentBody(dto.body)
    if (!body) throw new BadRequestException('Comment body is empty')

    const record = await this.prisma.fortressComment.create({
      data: {
        fortressId,
        parentId: dto.parentId ?? null,
        userId: user?.id,
        authorName: user?.name ?? 'Guest',
        body,
        status: 'published',
      },
    })

    return mapComment(record)
  }

  async updateStatus(
    id: string,
    status: CommentStatus,
    moderatorId?: string,
  ): Promise<FortressComment> {
    const existing = await this.prisma.fortressComment.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Comment not found')

    const record = await this.prisma.fortressComment.update({
      where: { id },
      data: { status },
    })

    await this.prisma.auditLog.create({
      data: {
        fortressId: record.fortressId,
        userId: moderatorId,
        action: 'comment.status_changed',
        details: {
          commentId: record.id,
          previousStatus: existing.status,
          status: record.status,
        },
      },
    })

    return mapComment(record)
  }

  async remove(id: string, moderatorId?: string): Promise<{ id: string; deleted: true }> {
    const existing = await this.prisma.fortressComment.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Comment not found')

    await this.prisma.$transaction([
      this.prisma.auditLog.create({
        data: {
          fortressId: existing.fortressId,
          userId: moderatorId,
          action: 'comment.deleted',
          details: { commentId: existing.id, authorName: existing.authorName },
        },
      }),
      this.prisma.fortressComment.delete({ where: { id } }),
    ])

    return { id, deleted: true }
  }
}
