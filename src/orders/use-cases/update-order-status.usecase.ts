import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { UpdateOrderStatusDto } from '../dtos/order-actions.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, dto: UpdateOrderStatusDto) {
    const validStatuses = [
      'pending',
      'accepted',
      'preparing',
      'on_the_way',
      'delivered',
      'rejected',
      'cancelled',
    ];

    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      );
    }

    const order = await this.orderRepository.findById(orderId, { lean: false });
    if (!order) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    order.status = dto.status as any;

    if (dto.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (dto.status === 'accepted' && !order.acceptedAt) {
      order.acceptedAt = new Date();
      const duration = order.estimatedDeliveryMinutes || 40;
      order.estimatedDeliveryTime = new Date(Date.now() + duration * 60 * 1000);
    } else if (dto.status === 'rejected') {
      if (!dto.reason) {
        throw new BadRequestException('Rejection reason is required');
      }
      order.rejectionReason = dto.reason;
      order.rejectedAt = new Date();
    }

    const updated = await (order as any).save();

    return {
      status: 'success',
      message: `Order status updated to ${dto.status}`,
      data: updated,
    };
  }
}
