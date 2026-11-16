import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorator/public.decorator.js';

/** Liveness/readiness probe for Docker / the hosting platform. */
@ApiExcludeController()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @Get()
  async check() {
    const dbUp = this.connection.readyState === 1;
    const body = { status: dbUp ? 'ok' : 'degraded', db: dbUp ? 'up' : 'down', uptime: Math.round(process.uptime()) };
    if (!dbUp) throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    return { data: body };
  }
}
