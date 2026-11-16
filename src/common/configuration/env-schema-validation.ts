import Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().integer().default(5000),
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  BASE_URL: Joi.string().uri().default('http://localhost:5000'),

  // Database (MONGO_URI preferred, DATABASE kept for backwards compatibility)
  MONGO_URI: Joi.string().optional(),
  DATABASE: Joi.string().optional(),

  // Auth
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long',
  }),
  JWT_EXPIRES_IN: Joi.string().default('30d'),
  ACCESS_TOKEN_EXPIRE_IN: Joi.string().optional(),

  // Email (EMAIL_* or SMTP_* aliases)
  EMAIL_HOST: Joi.string().optional(),
  EMAIL_PORT: Joi.number().optional(),
  EMAIL_USER: Joi.string().optional().allow(''),
  EMAIL_PASSWORD: Joi.string().optional().allow(''),
  EMAIL_FROM_NAME: Joi.string().optional(),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_AUTH_EMAIL: Joi.string().optional().allow(''),
  SMTP_AUTH_PASS: Joi.string().optional().allow(''),

  // HTTP
  CORS_ORIGINS: Joi.string().optional().allow(''),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(120),
  THROTTLE_TTL_SECONDS: Joi.number().integer().min(1).default(60),
  DNS_SERVERS: Joi.string().optional().allow(''),
  TRUST_PROXY: Joi.string().optional().allow(''),

  // Business
  RESTAURANT_TIMEZONE: Joi.string().default('Africa/Cairo'),

  // Push notifications (Firebase Cloud Messaging) - optional
  FIREBASE_PROJECT_ID: Joi.string().optional().allow(''),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional().allow(''),
  FIREBASE_PRIVATE_KEY: Joi.string().optional().allow(''),
  FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().optional().allow(''),

  // Seed admin (used by `npm run seed`)
  ADMIN_EMAIL: Joi.string().email({ tlds: { allow: false } }).optional(),
  ADMIN_PASSWORD: Joi.string().min(8).optional(),
})
  .or('MONGO_URI', 'DATABASE')
  .unknown(true);
