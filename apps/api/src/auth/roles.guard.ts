import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user) throw new UnauthorizedException()
    return roles.includes(user.role)
  }
}
