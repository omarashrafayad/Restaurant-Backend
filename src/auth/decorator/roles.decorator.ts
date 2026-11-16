import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../common/constants/roles.constant.js';

export const ROLES_KEY = 'roles';
export const Authorize = (...roles: (Roles | string)[]) => SetMetadata(ROLES_KEY, roles);
export const RolesAllowed = (...roles: (Roles | string)[]) => SetMetadata(ROLES_KEY, roles);
