import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { PromotionSchema } from '../promotions/schema/promotion.schema.js';
import { PricingService } from './pricing.service.js';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: ModelNames.Promotions, schema: PromotionSchema }])],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
