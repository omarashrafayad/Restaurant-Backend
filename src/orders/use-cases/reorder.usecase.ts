import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { CartService } from '../../cart/cart.service.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class ReorderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  /** Copies the items of a previous order into the cart (skipping unavailable ones). */
  async execute(orderId: string, userId: string) {
    const order = await this.orderRepository.model.findById(orderId).lean();
    if (!order || order.user.toString() !== userId) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    const skipped: string[] = [];
    for (const item of order.cartItems) {
      try {
        await this.cartService.addProductToCart(userId, {
          productId: item.product.toString(),
          quantity: item.quantity,
          notes: item.notes,
        });
      } catch {
        skipped.push(item.title ?? item.product.toString());
      }
    }

    const cart = await this.cartService.getLoggedUserCart(userId);
    return {
      ...cart,
      message: skipped.length
        ? `Some items are no longer available: ${skipped.join(', ')}`
        : 'Items added to your cart',
      skipped,
    };
  }
}
