import { Injectable, NotFoundException } from '@nestjs/common'
import type { CreateCommentDto, FortressComment } from '@hayastani/shared'
import { mapComment } from '../mappers'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByFortress(fortressId: string): Promise<FortressComment[]> {
    const records = await this.prisma.fortressComment.findMany({
      where: { fortressId, status: 'published' },
      orderBy: { createdAt: 'desc' },
    })
    return records.map(mapComment)
  }

  async create(
    fortressId: string,
    dto: CreateCommentDto,
    user?: { id: string; name: string },
  ): Promise<FortressComment> {
    const fortress = await this.prisma.fortress.findUnique({ where: { id: fortressId } })
    if (!fortress) throw new NotFoundException('Fortress not found')

    const record = await this.prisma.fortressComment.create({
      data: {
        fortressId,
        userId: user?.id,
        authorName: user?.name ?? 'Guest',
        body: dto.body,
        status: 'published',
      },
    })

    return mapComment(record)
  }
}
