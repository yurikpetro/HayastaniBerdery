import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { CommentStatus, CreateCommentDto } from '@hayastani/shared'
import { ContentRoles, RolesGuard } from '../auth/roles.guard'
import { CommentsService } from './comments.service'

@Controller('fortresses/:fortressId/comments')
export class CommentsController {
  constructor(@Inject(CommentsService) private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('fortressId') fortressId: string) {
    return this.commentsService.findByFortress(fortressId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('fortressId') fortressId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: { id: string; name: string } },
  ) {
    return this.commentsService.create(fortressId, dto, req.user)
  }
}

@Controller('comments')
export class AdminCommentsController {
  constructor(@Inject(CommentsService) private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  findAllForAdmin() {
    return this.commentsService.findAllForAdmin()
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: CommentStatus },
    @Req() req: { user: { id: string } },
  ) {
    return this.commentsService.updateStatus(id, body.status, req.user.id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ContentRoles()
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.commentsService.remove(id, req.user.id)
  }
}
