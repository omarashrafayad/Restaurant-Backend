import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderRepository } from '../repository/order.repository.js';
import { AddOrderReviewDto } from '../dtos/order-actions.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { OrderStatus } from '../order-status.js';
import { OrderEvents, OrderReviewedEvent } from '../order.events.js';

@Injectable()
export class AddOrderReviewUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(orderId: string, userId: string, dto: AddOrderReviewDto) {
    const order = await this.orderRepository.model.findById(orderId).lean();
    if (!order || order.user.toString() !== userId) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('You can only rate an order after it has been delivered');
    }

    // Conditional update: a second review can never overwrite the first one.
    const updated = await this.orderRepository.model.findOneAndUpdate(
      { _id: order._id, review: { $exists: false } },
      {
        $set: {
          review: {
            ratings: Math.round(dto.ratings),
            comment: dto.comment?.trim() || undefined,
            createdAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' },
    );
    if (!updated) throw new BadRequestException('You have already rated this order');

    const plain = updated.toObject();
    this.events.emit(OrderEvents.REVIEWED, { order: plain } satisfies OrderReviewedEvent);
    return {
      status: 'success',
      message: 'Thank you for your feedback!',
      data: plain,
    };
  }
}
