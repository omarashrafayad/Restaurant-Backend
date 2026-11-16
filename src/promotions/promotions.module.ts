import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { PromotionNotifier } from './promotion-notifier.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Promotion, PromotionSchema } from './schema/promotion.schema.js';
import { PromotionRepository } from './repository/promotion.repository.js';
import { PromotionsController } from './promotions.controller.js';
import { PromotionsService } from './promotions.service.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Promotions, schema: PromotionSchema }]),
    ProductsModule,
    CategoriesModule,
  ],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    PromotionRepository,
    PromotionNotifier,
  ],
  exports: [PromotionsService, PromotionRepository, PromotionNotifier],
})
export class PromotionsModule {}
