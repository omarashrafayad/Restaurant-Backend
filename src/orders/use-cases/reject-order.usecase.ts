import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { RejectOrderDto } from '../dtos/order-actions.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class RejectOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(orderId: string, dto: RejectOrderDto) {
    if (!dto.reason || !dto.reason.trim()) {
      throw new BadRequestException(
        'Rejection reason is required (e.g., outside delivery zone, no delivery riders currently)',
      );
    }

    const order = await this.orderRepository.findById(orderId, { lean: false });
    if (!order) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    if (order.status === 'rejected') {
      throw new BadRequestException('This order has already been rejected');
    }

    // Restore inventory quantities since order was rejected
    const bulkOps = order.cartItems.map((item: any) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: +item.quantity, sold: -item.quantity } },
      },
    }));
    await this.productRepository.bulkWrite(bulkOps);

    order.status = 'rejected';
    order.rejectionReason = dto.reason.trim();
    order.rejectedAt = new Date();

    const updated = await (order as any).save();

    return {
      status: 'success',
      message: 'Order rejected successfully',
      data: updated,
    };
  }
}
