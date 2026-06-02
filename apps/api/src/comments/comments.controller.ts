import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { CreateCommentDto } from '@hayastani/shared'
import { CommentsService } from './comments.service'

@Controller('fortresses/:fortressId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

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
