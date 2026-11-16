import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { RealtimeGateway } from './realtime.gateway.js';

@Global()
@Module({
  imports: [UsersModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
