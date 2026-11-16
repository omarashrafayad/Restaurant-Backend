import dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { swaggerConfig } from './common/swagger/swagger-config.js';
import { Environment } from './common/configuration/environment.interface.js';
// Optional: some ISPs fail to resolve MongoDB Atlas SRV records. Set
// DNS_SERVERS=8.8.8.8,8.8.4.4 to force public resolvers for this process.
if (process.env.DNS_SERVERS) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
  } catch {
    Logger.warn('Could not apply custom DNS_SERVERS', 'Bootstrap');
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  swaggerConfig.setup(app);

  const port = app.get(ConfigService<Environment, true>).get('port', { infer: true });
  await app.listen(port);
  Logger.log(`Server started on port: ${port}`, 'Bootstrap');
  Logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

await bootstrap();
