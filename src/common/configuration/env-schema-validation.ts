import Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().integer().default(5000),
  NODE_ENV: Joi.string().default('development'),
  BASE_URL: Joi.string().default('http://localhost:5000'),
  MONGO_URI: Joi.string().optional(),
  DATABASE: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ACCESS_TOKEN_EXPIRE_IN: Joi.string().default('7d'),
  JWT_COOKIE_EXPIRES_IN: Joi.number().optional().default(90),
  EMAIL_HOST: Joi.string().optional(),
  EMAIL_PORT: Joi.number().optional(),
  EMAIL_USER: Joi.string().optional().allow(''),
  EMAIL_PASSWORD: Joi.string().optional().allow(''),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_AUTH_EMAIL: Joi.string().optional().allow(''),
  SMTP_AUTH_PASS: Joi.string().optional().allow(''),
}).unknown(true);
