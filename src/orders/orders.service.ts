import { Injectable } from '@nestjs/common';
import { CheckoutUseCase } from './use-cases/checkout.usecase.js';
import { OrderLifecycleUseCase, TransitionActor } from './use-cases/order-lifecycle.usecase.js';
import { FindOrdersUseCase, Viewer } from './use-cases/find-orders.usecase.js';
import { AddOrderReviewUseCase } from './use-cases/add-order-review.usecase.js';
import { ReorderUseCase } from './use-cases/reorder.usecase.js';
import { CheckoutPreviewDto, CreateOrderDto } from './dtos/create-order.dto.js';
import { QueryOrdersDto } from './dtos/query-orders.dto.js';
import { AddOrderReviewDto } from './dtos/order-actions.dto.js';
import { OrderStatus } from './order-status.js';
import { OrderRepository } from './repository/order.repository.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly checkout: CheckoutUseCase,
    private readonly lifecycle: OrderLifecycleUseCase,
    private readonly finder: FindOrdersUseCase,
    private readonly review: AddOrderReviewUseCase,
    private readonly reorderUseCase: ReorderUseCase,
    private readonly orderRepository: OrderRepository,
  ) {}

  preview(userId: string, dto: CheckoutPreviewDto) {
    return this.checkout.preview(userId, dto);
  }

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.checkout.create(userId, dto);
    return this.finder.findOne(order._id.toString(), { userId, role: 'user' });
  }

  findAll(viewer: Viewer, query: QueryOrdersDto) {
    return this.finder.list(viewer, query);
  }

  findById(id: string, viewer: Viewer) {
    return this.finder.findOne(id, viewer);
  }

  active(userId: string) {
    return this.finder.active(userId);
  }

  async transition(id: string, to: OrderStatus, actor: TransitionActor, opts?: { reason?: string; estimatedDeliveryMinutes?: number }) {
    const order = await this.lifecycle.transition(id, to, actor, opts);
    return this.finder.findOne(order._id.toString(), { userId: actor.userId, role: actor.type === 'restaurant' ? 'admin' : 'user' });
  }

  markPaid(id: string) {
    return this.lifecycle.markPaid(id);
  }

  addReview(id: string, userId: string, dto: AddOrderReviewDto) {
    return this.review.execute(id, userId, dto);
  }

  reorder(id: string, userId: string) {
    return this.reorderUseCase.execute(id, userId);
  }

  delete(id: string) {
    return this.lifecycle.deleteOrder(id);
  }
}
