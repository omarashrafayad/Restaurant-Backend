import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from '../schema/promotion.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class PromotionRepository extends BaseRepository<Promotion> {
  constructor(
    @InjectModel(ModelNames.Promotions)
    private readonly promotionModel: Model<PromotionDocument>,
  ) {
    super(promotionModel as unknown as Model<Promotion>);
  }
}
