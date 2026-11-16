import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';
import { Roles } from '../../common/constants/roles.constant.js';

@Injectable()
export class FindOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, userId: string, role: string) {
    const order = await this.orderRepository.findById(orderId, {
      populate: [
        { path: 'user', select: 'name email phone addresses' },
        { path: 'cartItems.product', select: 'title imageCover price priceAfterDiscount' },
      ],
    });

    if (!order) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    const orderUserId = (order as any).user?._id?.toString() || (order as any).user?.toString();
    if (role === Roles.USER && orderUserId !== userId) {
      throw new ForbidenException('You are not authorized to view this order');
    }

    return {
      status: 'success',
      data: order,
    };
  }
}
