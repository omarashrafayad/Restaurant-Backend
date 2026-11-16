export interface Environment {
  port: number;
  nodeEnv: string;
  baseUrl: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  accessTokenExpireIn: string;
  corsOrigins: string[] | '*';
  throttle: { limit: number; ttlSeconds: number };
  timezone: string;
  smtp: ISmtp;
  firebase: IFirebase;
}

export interface ISmtp {
  host: string;
  port: number;
  secure: boolean;
  fromName: string;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface IFirebase {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountPath?: string;
}
