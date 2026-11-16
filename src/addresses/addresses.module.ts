import { Module } from '@nestjs/common';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module.js';
import { AddressesController } from './addresses.controller.js';
import { AddressesService } from './addresses.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule, DeliveryZonesModule],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
