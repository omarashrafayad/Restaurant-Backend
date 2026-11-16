import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Product, ProductSchema } from './schema/product.schema.js';
import { ProductRepository } from './repository/product.repository.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { CreateProductUseCase } from './use-cases/create-product.usecase.js';
import { FindAllProductsUseCase } from './use-cases/find-all-products.usecase.js';
import { FindProductByIdUseCase } from './use-cases/find-product-by-id.usecase.js';
import { UpdateProductUseCase } from './use-cases/update-product.usecase.js';
import { DeleteProductUseCase } from './use-cases/delete-product.usecase.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { SubcategoriesModule } from '../subcategories/subcategories.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Products, schema: ProductSchema }]),
    CategoriesModule,
    SubcategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
