export interface Environment {
  port: number;
  nodeEnv: string;
  baseUrl: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  accessTokenExpireIn: string;
  smtp: ISmtp;
}

export interface ISmtp {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}
