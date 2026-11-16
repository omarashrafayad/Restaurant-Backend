import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Promotion, PromotionSchema } from './schema/promotion.schema.js';
import { PromotionRepository } from './repository/promotion.repository.js';
import { PromotionsController } from './promotions.controller.js';
import { PromotionsService } from './promotions.service.js';
import { CreatePromotionUseCase } from './use-cases/create-promotion.usecase.js';
import { FindAllPromotionsUseCase } from './use-cases/find-all-promotions.usecase.js';
import { FindPromotionByIdUseCase } from './use-cases/find-promotion-by-id.usecase.js';
import { UpdatePromotionUseCase } from './use-cases/update-promotion.usecase.js';
import { DeletePromotionUseCase } from './use-cases/delete-promotion.usecase.js';
import { GetActivePromotionsUseCase } from './use-cases/get-active-promotions.usecase.js';
import { ApplyQuickDiscountUseCase } from './use-cases/apply-quick-discount.usecase.js';
import { RemoveQuickDiscountUseCase } from './use-cases/remove-quick-discount.usecase.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Promotions, schema: PromotionSchema }]),
    ProductsModule,
  ],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    PromotionRepository,
    CreatePromotionUseCase,
    FindAllPromotionsUseCase,
    FindPromotionByIdUseCase,
    UpdatePromotionUseCase,
    DeletePromotionUseCase,
    GetActivePromotionsUseCase,
    ApplyQuickDiscountUseCase,
    RemoveQuickDiscountUseCase,
  ],
  exports: [PromotionsService, PromotionRepository],
})
export class PromotionsModule {}
