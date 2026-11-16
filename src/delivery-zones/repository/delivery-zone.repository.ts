import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliveryZone, DeliveryZoneDocument } from '../schema/delivery-zone.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class DeliveryZoneRepository extends BaseRepository<DeliveryZone> {
  constructor(
    @InjectModel(ModelNames.DeliveryZones)
    private readonly zoneModel: Model<DeliveryZoneDocument>,
  ) {
    super(zoneModel as unknown as Model<DeliveryZone>);
  }
}
