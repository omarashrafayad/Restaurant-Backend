import { Module } from '@nestjs/common';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [CategoriesModule, ProductsModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
