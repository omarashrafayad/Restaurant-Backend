import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator.js';
import { ROLES_KEY } from '../decorator/roles.decorator.js';
import { Roles } from '../../common/constants/roles.constant.js';
import { RequestWithUser } from './jwt-auth.guard.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const roles = this.reflector.getAllAndOverride<(Roles | string)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const principal = request.principal;

    if (!principal || !principal.role) {
      throw new ForbidenException('You are not allowed to access this resource');
    }

    const canAccess = roles.includes(principal.role);

    if (!canAccess) {
      throw new ForbidenException('You are not allowed to access this resource');
    }

    return true;
  }
}
