import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { CartRepository } from '../../cart/repository/cart.repository.js';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { DeliveryZoneRepository } from '../../delivery-zones/repository/delivery-zone.repository.js';
import { UserRepository } from '../../users/repository/user.repository.js';
import { CreateOrderDto } from '../dtos/create-order.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class CreateCashOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly zoneRepository: DeliveryZoneRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, cartId: string, dto: CreateOrderDto) {
    const taxPrice = 0;

    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundException(`There is no such cart with id ${cartId}`);
    }

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const user = await this.userRepository.findById(userId);

    let shippingAddress = dto.shippingAddress;
    if (!shippingAddress && (user as any)?.addresses && (user as any).addresses.length > 0) {
      shippingAddress = (user as any).addresses[0];
    }

    if (!shippingAddress || !shippingAddress.city) {
      throw new BadRequestException(
        'Shipping address with a valid city is required to place an order',
      );
    }

    const cityQuery = shippingAddress.city.trim();
    const zone = await this.zoneRepository.findOne({
      isActive: true,
      $or: [
        { name: { $regex: new RegExp(`^${cityQuery}$`, 'i') } },
        { nameAr: { $regex: new RegExp(`^${cityQuery}$`, 'i') } },
      ],
    });

    if (!zone) {
      const activeZones = await this.zoneRepository.find(
        { isActive: true },
        { fields: 'name nameAr deliveryFee' },
      );
      const allowedList = activeZones
        .map((z: any) => `${z.name} (${z.nameAr || ''}) - ${z.deliveryFee} EGP`)
        .join(', ');

      throw new BadRequestException(
        `Delivery is not available in "${shippingAddress.city}". We currently deliver only to: ${allowedList}`,
      );
    }

    const shippingPrice = (zone as any).deliveryFee;
    const estimatedDeliveryMinutes = (zone as any).estimatedDeliveryMinutes || 40;

    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;

    const totalOrderPrice = Number(cartPrice) + Number(taxPrice) + Number(shippingPrice);
    const notes = dto.notes || dto.orderNotes || '';

    const order = await this.orderRepository.create({
      user: userId as any,
      totalOrderPrice,
      shippingPrice,
      taxPrice,
      shippingAddress: {
        details: shippingAddress.details,
        phone: shippingAddress.phone || (user as any)?.phone,
        city: (zone as any).name,
        postalCode: shippingAddress.postalCode,
        coordinates: shippingAddress.coordinates,
        locationUrl: shippingAddress.locationUrl,
      },
      cartItems: cart.cartItems,
      notes,
      status: 'pending',
      estimatedDeliveryMinutes,
    });

    if (order) {
      const bulkOps = cart.cartItems.map((item: any) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await this.productRepository.bulkWrite(bulkOps);
      await this.cartRepository.findByIdAndDelete(cartId);
    }

    return {
      status: 'success',
      data: order,
    };
  }
}
