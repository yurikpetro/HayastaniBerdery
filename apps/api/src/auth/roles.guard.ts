import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserRole } from '@hayastani/shared'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
export const ContentRoles = () => Roles('moderator', 'admin', 'super_admin')
export const UserAdminRoles = () => Roles('admin', 'super_admin')
export const SuperAdminRoles = () => Roles('super_admin')

export const roleRank: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole) {
  return roleRank[actorRole] > roleRank[targetRole]
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user) throw new UnauthorizedException()
    if (user.isBanned) throw new ForbiddenException('User is banned')
    return roles.includes(user.role)
  }
}
