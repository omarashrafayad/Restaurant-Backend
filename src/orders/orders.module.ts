import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { OrderSchema } from './schema/order.schema.js';
import { CounterSchema } from './schema/counter.schema.js';
import { OrderRepository } from './repository/order.repository.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { CheckoutUseCase } from './use-cases/checkout.usecase.js';
import { OrderLifecycleUseCase } from './use-cases/order-lifecycle.usecase.js';
import { FindOrdersUseCase } from './use-cases/find-orders.usecase.js';
import { AddOrderReviewUseCase } from './use-cases/add-order-review.usecase.js';
import { ReorderUseCase } from './use-cases/reorder.usecase.js';
import { CartModule } from '../cart/cart.module.js';
import { ProductsModule } from '../products/products.module.js';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module.js';
import { UsersModule } from '../users/users.module.js';
import { AddressesModule } from '../addresses/addresses.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.Orders, schema: OrderSchema },
      { name: ModelNames.Counters, schema: CounterSchema },
    ]),
    CartModule,
    ProductsModule,
    DeliveryZonesModule,
    UsersModule,
    AddressesModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    CheckoutUseCase,
    OrderLifecycleUseCase,
    FindOrdersUseCase,
    AddOrderReviewUseCase,
    ReorderUseCase,
  ],
  exports: [OrdersService, OrderRepository],
})
export class OrdersModule {}
