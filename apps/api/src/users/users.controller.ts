import { Body, Controller, Get, Inject, Param, Patch, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { BanUserDto, UpdateUserRoleDto, UserListQuery, UserRole } from '@hayastani/shared'
import { RolesGuard, UserAdminRoles } from '../auth/roles.guard'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UserAdminRoles()
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: UserListQuery) {
    return this.usersService.findAll({
      ...query,
      banned:
        query.banned == null
          ? undefined
          : String(query.banned) === 'true',
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
    @Req() req: { user: { id: string; email: string; role: UserRole } },
  ) {
    return this.usersService.updateRole(id, body, req.user)
  }

  @Patch(':id/ban')
  ban(
    @Param('id') id: string,
    @Body() body: BanUserDto,
    @Req() req: { user: { id: string; email: string; role: UserRole } },
  ) {
    return this.usersService.ban(id, body, req.user)
  }

  @Patch(':id/unban')
  unban(
    @Param('id') id: string,
    @Req() req: { user: { id: string; email: string; role: UserRole } },
  ) {
    return this.usersService.unban(id, req.user)
  }
}
