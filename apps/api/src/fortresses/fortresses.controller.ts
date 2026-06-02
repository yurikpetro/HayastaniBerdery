import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Fortress, FortressListQuery } from '@hayastani/shared'
import { Roles, RolesGuard } from '../auth/roles.guard'
import { FortressesService } from './fortresses.service'

@Controller('fortresses')
export class FortressesController {
  constructor(private readonly fortressesService: FortressesService) {}

  @Get()
  findAll(@Query() query: FortressListQuery) {
    return this.fortressesService.findAll(query)
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.fortressesService.findBySlug(slug)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator')
  create(@Body() body: Fortress, @Req() req: { user: { id: string } }) {
    return this.fortressesService.create(body, req.user.id)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator')
  update(
    @Param('id') id: string,
    @Body() body: Fortress,
    @Req() req: { user: { id: string } },
  ) {
    return this.fortressesService.replace(id, body, req.user.id)
  }
}
