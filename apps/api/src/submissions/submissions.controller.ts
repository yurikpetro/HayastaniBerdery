import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { CreateSubmissionDto, SubmissionStatus } from '@hayastani/shared'
import { Roles, RolesGuard } from '../auth/roles.guard'
import { SubmissionsService } from './submissions.service'

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator')
  findAll() {
    return this.submissionsService.findAll()
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
  @Roles('admin', 'moderator')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SubmissionStatus; moderatorNote?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.submissionsService.updateStatus(
      id,
      body.status,
      body.moderatorNote,
      req.user.id,
    )
  }
}
