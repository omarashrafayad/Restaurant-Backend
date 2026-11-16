import path from 'path';
import express from 'express';
import helmet from 'helmet';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Environment } from './common/configuration/environment.interface.js';
import { formatInputValidationErrors } from './common/error-handling/input-validation/format-input-validation-errors.js';

/** Shared HTTP setup used by main.ts and by the e2e tests. */
export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService<Environment, true>);
  const origins = config.get('corsOrigins', { infer: true });

  // Only trust X-Forwarded-For when actually behind a proxy (otherwise clients
  // could spoof their IP and bypass rate limiting). TRUST_PROXY=1 behind nginx etc.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: origins === '*' ? true : origins, credentials: true });
  app.setGlobalPrefix('api/v1');
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { maxAge: '7d' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({ errors: formatInputValidationErrors(errors) }),
    }),
  );
  app.enableShutdownHooks();
  return app;
}
