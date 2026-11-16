import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Cart, CartSchema } from './schema/cart.schema.js';
import { CartRepository } from './repository/cart.repository.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { ProductsModule } from '../products/products.module.js';
import { CouponsModule } from '../coupons/coupons.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Cart, schema: CartSchema }]),
    ProductsModule,
    CouponsModule,
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
