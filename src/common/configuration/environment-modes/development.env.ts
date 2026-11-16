import { Environment } from '../environment.interface.js';
import { defaultEnv } from './default.env.js';

export const developmentEnv = (): Environment => {
  return {
    ...defaultEnv(),
  };
};
