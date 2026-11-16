import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IPrincipal } from '../interfaces/principal.interface.js';
import { UsersService } from '../../users/users.service.js';
import { UnAuthorizedException } from '../../common/error-handling/custom-excepction/un-authorized.exception.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator.js';

export type RequestWithUser = Request & {
  principal: IPrincipal;
  user: any;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnAuthorizedException('You are not logged in. Please login to get access to this route');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnAuthorizedException('No token provided');
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      const userId = payload.userId || payload._id;

      if (!userId) {
        throw new UnAuthorizedException('Invalid token payload');
      }

      const currentUser = await this.usersService.findOne({ _id: userId });
      if (!currentUser) {
        throw new UnAuthorizedException('The user that belongs to this token no longer exists');
      }

      if (!currentUser.active) {
        throw new UnAuthorizedException('This account has been deactivated');
      }

      if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = Math.floor(
          new Date(currentUser.passwordChangedAt).getTime() / 1000,
        );
        if (payload.iat && passChangedTimestamp > payload.iat) {
          throw new UnAuthorizedException('User recently changed password. Please login again');
        }
      }

      const principal: IPrincipal = {
        user: {
          _id: currentUser._id.toString(),
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
        },
        role: currentUser.role,
      };

      request.principal = principal;
      request.user = currentUser;
    } catch (error: any) {
      this.logger.error(error.message);
      throw new UnAuthorizedException(error.message || 'Invalid token');
    }

    return true;
  }
}
