import { Module } from '@nestjs/common';
import { PromotionsModule } from '../promotions/promotions.module.js';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [CategoriesModule, ProductsModule, PromotionsModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
