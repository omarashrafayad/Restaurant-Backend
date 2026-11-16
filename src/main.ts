import dns from 'dns';
import path from 'path';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { swaggerConfig } from './common/swagger/swagger-config.js';
import { Environment } from './common/configuration/environment.interface.js';

// Setup IPv4-first and public DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore if custom DNS settings are restricted
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global API route prefix
  app.setGlobalPrefix('api/v1');

  // Serve static uploads
  app.use(express.static(path.join(process.cwd(), 'uploads')));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Initialize Swagger
  swaggerConfig.setup(app);

  const configService = app.get(ConfigService<Environment>);
  const port = configService.get<number>('port') || process.env.PORT || 5000;

  await app.listen(port);
  Logger.log(`Server started on port: ${port}`, 'Bootstrap');
  Logger.log(`Swagger documentation available at http://localhost:${port}/api/docs and /api-docs`, 'Bootstrap');
}

await bootstrap();
