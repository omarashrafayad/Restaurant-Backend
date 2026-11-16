import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IPrincipal } from '../interfaces/principal.interface.js';
import { Roles } from '../../common/constants/roles.constant.js';

export class Principal implements IPrincipal {
  user!: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  role!: Roles | string;
}

export const CurrentAccount = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IPrincipal => {
    const request = ctx.switchToHttp().getRequest();
    return request.principal;
  },
);

export const CurrentUser = CurrentAccount;
