import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Order, OrderSchema } from './schema/order.schema.js';
import { OrderRepository } from './repository/order.repository.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { CreateCashOrderUseCase } from './use-cases/create-cash-order.usecase.js';
import { FindAllOrdersUseCase } from './use-cases/find-all-orders.usecase.js';
import { FindOrderByIdUseCase } from './use-cases/find-order-by-id.usecase.js';
import { DeleteOrderUseCase } from './use-cases/delete-order.usecase.js';
import { AcceptOrderUseCase } from './use-cases/accept-order.usecase.js';
import { RejectOrderUseCase } from './use-cases/reject-order.usecase.js';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.usecase.js';
import { UpdateOrderPaidUseCase } from './use-cases/update-order-paid.usecase.js';
import { UpdateOrderDeliveredUseCase } from './use-cases/update-order-delivered.usecase.js';
import { AddOrderReviewUseCase } from './use-cases/add-order-review.usecase.js';
import { GetDailySalesAnalyticsUseCase } from './use-cases/get-daily-sales-analytics.usecase.js';
import { GetSalesSummaryAnalyticsUseCase } from './use-cases/get-sales-summary-analytics.usecase.js';
import { CartModule } from '../cart/cart.module.js';
import { ProductsModule } from '../products/products.module.js';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Orders, schema: OrderSchema }]),
    CartModule,
    ProductsModule,
    DeliveryZonesModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    CreateCashOrderUseCase,
    FindAllOrdersUseCase,
    FindOrderByIdUseCase,
    DeleteOrderUseCase,
    AcceptOrderUseCase,
    RejectOrderUseCase,
    UpdateOrderStatusUseCase,
    UpdateOrderPaidUseCase,
    UpdateOrderDeliveredUseCase,
    AddOrderReviewUseCase,
    GetDailySalesAnalyticsUseCase,
    GetSalesSummaryAnalyticsUseCase,
  ],
  exports: [OrdersService, OrderRepository],
})
export class OrdersModule {}
