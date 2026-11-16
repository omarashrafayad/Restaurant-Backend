import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class UpdateOrderPaidUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId, { lean: false });
    if (!order) {
      throw new NotFoundException(`There is no such order with id: ${orderId}`);
    }

    order.isPaid = true;
    order.paidAt = new Date();

    const updated = await (order as any).save();

    return {
      status: 'success',
      data: updated,
    };
  }
}
