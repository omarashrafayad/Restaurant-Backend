import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { AcceptOrderDto } from '../dtos/order-actions.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class AcceptOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, dto: AcceptOrderDto) {
    const order = await this.orderRepository.findById(orderId, { lean: false });
    if (!order) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    if (order.status === 'rejected') {
      throw new BadRequestException('This order has already been rejected');
    }

    const durationMinutes =
      Number(dto.estimatedDeliveryMinutes) ||
      order.estimatedDeliveryMinutes ||
      40;

    order.status = 'accepted';
    order.acceptedAt = new Date();
    order.estimatedDeliveryMinutes = durationMinutes;
    order.estimatedDeliveryTime = new Date(Date.now() + durationMinutes * 60 * 1000);

    const updated = await (order as any).save();

    return {
      status: 'success',
      message: 'Order accepted successfully',
      data: updated,
    };
  }
}
