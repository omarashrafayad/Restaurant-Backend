import { Environment } from '../environment.interface.js';
import { defaultEnv } from './default.env.js';

export const stagingEnv = (): Environment => {
  return {
    ...defaultEnv(),
  };
};
