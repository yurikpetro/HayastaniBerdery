import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles, RolesGuard } from '../auth/roles.guard'
import { PrismaService } from '../prisma/prisma.service'

@Controller('audit')
export class AuditController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator')
  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        fortress: { select: { id: true, slug: true } },
      },
    })
  }
}
