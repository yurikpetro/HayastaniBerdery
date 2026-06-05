import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { CreateSubmissionDto, SubmissionStatus } from '@hayastani/shared'
import { ContentRoles, RolesGuard } from '../auth/roles.guard'
import { SubmissionsService } from './submissions.service'

@Controller('submissions')
export class SubmissionsController {
  constructor(
    @Inject(SubmissionsService) private readonly submissionsService: SubmissionsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  findAll() {
    return this.submissionsService.findAll()
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() dto: CreateSubmissionDto,
    @Req() req: { user: { id: string; name: string } },
  ) {
    return this.submissionsService.create(dto, req.user)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SubmissionStatus; moderatorNote?: string; publishedId?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.submissionsService.updateStatus(
      id,
      body.status,
      body.moderatorNote,
      req.user.id,
      body.publishedId,
    )
  }
}
