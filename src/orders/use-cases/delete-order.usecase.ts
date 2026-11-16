import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<void> {
    const deleted = await this.orderRepository.findByIdAndDelete(orderId);
    if (!deleted) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }
  }
}
