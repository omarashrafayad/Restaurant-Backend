import { Environment } from '../environment.interface.js';

export const defaultEnv = (): Environment => {
  const env = process.env;
  const emailPort = Number(env.EMAIL_PORT || env.SMTP_PORT || 465);
  const emailUser = env.EMAIL_USER || env.SMTP_AUTH_EMAIL || '';
  const emailPass = env.EMAIL_PASSWORD || env.SMTP_AUTH_PASS || '';
  const origins = (env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

  return {
    nodeEnv: env.NODE_ENV || 'development',
    port: Number(env.PORT) || 5000,
    baseUrl: (env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, ''),
    mongoUri: env.MONGO_URI || env.DATABASE || '',
    // Presence and length are enforced by the Joi schema at boot.
    jwtSecret: env.JWT_SECRET as string,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '30d',
    accessTokenExpireIn: env.ACCESS_TOKEN_EXPIRE_IN || env.JWT_EXPIRES_IN || '30d',
    corsOrigins: origins.length ? origins : '*',
    throttle: {
      limit: Number(env.THROTTLE_LIMIT) || 120,
      ttlSeconds: Number(env.THROTTLE_TTL_SECONDS) || 60,
    },
    timezone: env.RESTAURANT_TIMEZONE || 'Africa/Cairo',
    smtp: {
      host: env.EMAIL_HOST || env.SMTP_HOST || 'smtp.gmail.com',
      port: emailPort,
      secure: env.SMTP_SECURE === 'true' || emailPort === 465,
      fromName: env.EMAIL_FROM_NAME || 'Take Five',
      auth: emailUser && emailPass ? { user: emailUser, pass: emailPass } : undefined,
    },
    firebase: {
      projectId: env.FIREBASE_PROJECT_ID || undefined,
      clientEmail: env.FIREBASE_CLIENT_EMAIL || undefined,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || undefined,
      serviceAccountPath: env.FIREBASE_SERVICE_ACCOUNT_PATH || undefined,
    },
  };
};
