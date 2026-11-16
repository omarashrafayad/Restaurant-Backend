import { Environment } from './environment.interface.js';
import { developmentEnv } from './environment-modes/development.env.js';
import { productionEnv } from './environment-modes/production.env.js';
import { stagingEnv } from './environment-modes/staging.env.js';

export const environment: Record<string, () => Environment> = {
  development: () => developmentEnv(),
  production: () => productionEnv(),
  staging: () => stagingEnv(),
};

export default (): Environment => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const getEnvToLoad = environment[nodeEnv] || developmentEnv;
  return getEnvToLoad();
};
