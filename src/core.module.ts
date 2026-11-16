import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => {
        const uri =
          configService.get<string>('mongoUri') ||
          process.env.MONGO_URI ||
          process.env.DATABASE ||
          '';
        return {
          uri,
        };
      },
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class CoreModule {}
