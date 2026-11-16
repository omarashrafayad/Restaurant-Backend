import { Environment } from './environment.interface.js';
import { defaultEnv } from './environment-modes/default.env.js';

/**
 * All environments share the same mapping; behaviour differences are driven by
 * env variables (NODE_ENV, CORS_ORIGINS, ...) rather than duplicated files.
 */
export default (): Environment => defaultEnv();
