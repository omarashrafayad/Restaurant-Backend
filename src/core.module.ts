import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { envSchema } from './common/configuration/env-schema-validation.js';
import configMapping from './common/configuration/config-mapping.js';
import { Environment } from './common/configuration/environment.interface.js';
import { CustomExceptionFilter } from './common/error-handling/custom-exception.filter.js';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [configMapping],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => ({
        uri: config.get('mongoUri', { infer: true }),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => ({
        secret: config.get('jwtSecret', { infer: true }),
        signOptions: {
          expiresIn: config.get('accessTokenExpireIn', { infer: true }) as any,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => {
        const throttle = config.get('throttle', { infer: true });
        return {
          throttlers: [{ name: 'default', ttl: throttle.ttlSeconds * 1000, limit: throttle.limit }],
          // Lets the e2e suite create many accounts quickly.
          skipIf: () => process.env.THROTTLE_DISABLED === 'true',
        };
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class CoreModule {}
