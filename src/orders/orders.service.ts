import { Injectable } from '@nestjs/common';
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
import { CreateOrderDto } from './dtos/create-order.dto.js';
import {
  AcceptOrderDto,
  AddOrderReviewDto,
  RejectOrderDto,
  UpdateOrderStatusDto,
} from './dtos/order-actions.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { OrderRepository } from './repository/order.repository.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly createCashOrderUseCase: CreateCashOrderUseCase,
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
    private readonly rejectOrderUseCase: RejectOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly updateOrderPaidUseCase: UpdateOrderPaidUseCase,
    private readonly updateOrderDeliveredUseCase: UpdateOrderDeliveredUseCase,
    private readonly addOrderReviewUseCase: AddOrderReviewUseCase,
    private readonly getDailySalesUseCase: GetDailySalesAnalyticsUseCase,
    private readonly getSalesSummaryUseCase: GetSalesSummaryAnalyticsUseCase,
    private readonly orderRepository: OrderRepository,
  ) {}

  createCashOrder(userId: string, cartId: string, dto: CreateOrderDto) {
    return this.createCashOrderUseCase.execute(userId, cartId, dto);
  }

  findAll(userId: string, role: string, query: PaginationDto) {
    return this.findAllOrdersUseCase.execute(userId, role, query);
  }

  findById(orderId: string, userId: string, role: string) {
    return this.findOrderByIdUseCase.execute(orderId, userId, role);
  }

  delete(orderId: string) {
    return this.deleteOrderUseCase.execute(orderId);
  }

  acceptOrder(orderId: string, dto: AcceptOrderDto) {
    return this.acceptOrderUseCase.execute(orderId, dto);
  }

  rejectOrder(orderId: string, dto: RejectOrderDto) {
    return this.rejectOrderUseCase.execute(orderId, dto);
  }

  updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    return this.updateOrderStatusUseCase.execute(orderId, dto);
  }

  updateToPaid(orderId: string) {
    return this.updateOrderPaidUseCase.execute(orderId);
  }

  updateToDelivered(orderId: string) {
    return this.updateOrderDeliveredUseCase.execute(orderId);
  }

  addReview(orderId: string, userId: string, dto: AddOrderReviewDto) {
    return this.addOrderReviewUseCase.execute(orderId, userId, dto);
  }

  getDailySalesAnalytics(dateStr?: string) {
    return this.getDailySalesUseCase.execute(dateStr);
  }

  getSalesSummaryAnalytics() {
    return this.getSalesSummaryUseCase.execute();
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.orderRepository.find(filter, options);
  }
}
