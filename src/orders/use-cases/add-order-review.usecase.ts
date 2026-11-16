import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { AddOrderReviewDto } from '../dtos/order-actions.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';

@Injectable()
export class AddOrderReviewUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, userId: string, dto: AddOrderReviewDto) {
    if (!dto.ratings || dto.ratings < 1 || dto.ratings > 5) {
      throw new BadRequestException('Ratings value is required and must be between 1 and 5');
    }

    const order = await this.orderRepository.findById(orderId, { lean: false });
    if (!order) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    const orderUserId = (order.user as any)?._id?.toString() || order.user.toString();
    if (orderUserId !== userId) {
      throw new ForbidenException('You are not authorized to review this order');
    }

    if (!order.isDelivered && order.status !== 'delivered') {
      throw new BadRequestException(
        'You can only review and rate an order after it has been delivered',
      );
    }

    if (order.review && order.review.ratings) {
      throw new BadRequestException('You have already submitted a review for this order');
    }

    order.review = {
      ratings: Number(dto.ratings),
      comment: dto.comment?.trim() || '',
      createdAt: new Date(),
    };

    const updated = await (order as any).save();

    return {
      status: 'success',
      message: 'Order review submitted successfully. Thank you for your feedback!',
      data: updated,
    };
  }
}
