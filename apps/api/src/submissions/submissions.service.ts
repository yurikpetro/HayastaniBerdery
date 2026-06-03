import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type {
  CreateSubmissionDto,
  Fortress,
  FortressSubmission,
  SubmissionStatus,
} from '@hayastani/shared'
import { mapSubmission } from '../mappers'
import { FortressesService } from '../fortresses/fortresses.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FortressesService) private readonly fortressesService: FortressesService,
  ) {}

  async findAll(): Promise<FortressSubmission[]> {
    const records = await this.prisma.fortressSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return records.map(mapSubmission)
  }

  async create(
    dto: CreateSubmissionDto,
    user?: { id: string; name: string },
  ): Promise<FortressSubmission> {
    const proposed = {
      ...dto.proposedFortress,
      id: `draft-${Date.now()}`,
      status: 'review' as const,
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    const record = await this.prisma.fortressSubmission.create({
      data: {
        userId: user?.id,
        submittedByName: user?.name ?? 'Guest',
        submitterNote: dto.submitterNote,
        payload: proposed as unknown as Prisma.InputJsonValue,
        status: 'new',
      },
    })

    return mapSubmission(record)
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
    moderatorNote?: string,
    moderatorId?: string,
  ): Promise<FortressSubmission> {
    const submission = await this.prisma.fortressSubmission.findUnique({ where: { id } })
    if (!submission) throw new NotFoundException('Submission not found')

    let publishedId = submission.publishedId

    if (status === 'accepted') {
      const proposed = submission.payload as unknown as Fortress
      const published = await this.fortressesService.create(
        { ...proposed, status: 'published' },
        moderatorId,
      )
      publishedId = published.id
    }

    const updated = await this.prisma.fortressSubmission.update({
      where: { id },
      data: {
        status: status.replace(/-/g, '_') as never,
        moderatorNote,
        publishedId,
      },
    })

    return mapSubmission(updated)
  }
}
