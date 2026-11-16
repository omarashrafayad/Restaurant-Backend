import { Roles } from '../../common/constants/roles.constant.js';

export interface IPrincipal {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  role: Roles | string;
}
