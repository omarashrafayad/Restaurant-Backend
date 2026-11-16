import { Environment } from '../environment.interface.js';

export const defaultEnv = (): Environment => {
  const mongoUri = (process.env.MONGO_URI || process.env.DATABASE || '') as string;
  const emailHost = (process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com') as string;
  const emailPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465);
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_AUTH_EMAIL || '') as string;
  const emailPass = (process.env.EMAIL_PASSWORD || process.env.SMTP_AUTH_PASS || '') as string;
  const emailSecure = process.env.SMTP_SECURE === 'true' || emailPort === 465;

  return {
    nodeEnv: (process.env.NODE_ENV || 'development') as string,
    port: Number(process.env.PORT) || 5000,
    baseUrl: (process.env.BASE_URL || 'http://localhost:5000') as string,
    mongoUri,
    jwtSecret: (process.env.JWT_SECRET || 'secretKey') as string,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    accessTokenExpireIn: (process.env.ACCESS_TOKEN_EXPIRE_IN || process.env.JWT_EXPIRES_IN || '7d') as string,
    smtp: {
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: emailUser && emailPass ? { user: emailUser, pass: emailPass } : undefined,
    },
  };
};
