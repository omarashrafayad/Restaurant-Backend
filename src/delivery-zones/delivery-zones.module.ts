import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { DeliveryZone, DeliveryZoneSchema } from './schema/delivery-zone.schema.js';
import { DeliveryZoneRepository } from './repository/delivery-zone.repository.js';
import { DeliveryZonesController } from './delivery-zones.controller.js';
import { DeliveryZonesService } from './delivery-zones.service.js';
import { CreateDeliveryZoneUseCase } from './use-cases/create-delivery-zone.usecase.js';
import { FindAllDeliveryZonesUseCase } from './use-cases/find-all-delivery-zones.usecase.js';
import { FindDeliveryZoneByIdUseCase } from './use-cases/find-delivery-zone-by-id.usecase.js';
import { UpdateDeliveryZoneUseCase } from './use-cases/update-delivery-zone.usecase.js';
import { DeleteDeliveryZoneUseCase } from './use-cases/delete-delivery-zone.usecase.js';
import { CheckDeliveryFeeUseCase } from './use-cases/check-delivery-fee.usecase.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.DeliveryZones, schema: DeliveryZoneSchema }]),
  ],
  controllers: [DeliveryZonesController],
  providers: [
    DeliveryZonesService,
    DeliveryZoneRepository,
    CreateDeliveryZoneUseCase,
    FindAllDeliveryZonesUseCase,
    FindDeliveryZoneByIdUseCase,
    UpdateDeliveryZoneUseCase,
    DeleteDeliveryZoneUseCase,
    CheckDeliveryFeeUseCase,
  ],
  exports: [DeliveryZonesService, DeliveryZoneRepository],
})
export class DeliveryZonesModule {}
