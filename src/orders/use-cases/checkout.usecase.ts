import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import type { ClientSession, Connection } from 'mongoose';
import { CartService, PricedCart } from '../../cart/cart.service.js';
import { SettingsService } from '../../settings/settings.service.js';
import { AddressesService } from '../../addresses/addresses.service.js';
import { UserRepository } from '../../users/repository/user.repository.js';
import { DeliveryZoneRepository } from '../../delivery-zones/repository/delivery-zone.repository.js';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { OrderRepository } from '../repository/order.repository.js';
import { CheckoutPreviewDto, CreateOrderDto } from '../dtos/create-order.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { roundMoney } from '../../common/utils/money.util.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';
import { Counter, ORDER_NUMBER_START } from '../schema/counter.schema.js';
import { OrderStatus } from '../order-status.js';
import { OrderEvents, OrderCreatedEvent } from '../order.events.js';

export interface CheckoutQuote {
  canPlaceOrder: boolean;
  /** Human readable reasons why the order cannot be placed yet. */
  issues: string[];
  restaurant: Awaited<ReturnType<SettingsService['getStatus']>>;
  cart: PricedCart;
  address?: Record<string, any>;
  zone?: {
    _id: string;
    name: string;
    nameAr?: string;
    deliveryFee: number;
    minOrderAmount: number;
    estimatedDeliveryMinutes: number;
  };
  subtotal: number;
  couponDiscount: number;
  itemsDiscount: number;
  taxPercentage: number;
  taxPrice: number;
  deliveryFee: number;
  total: number;
}

@Injectable()
export class CheckoutUseCase {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ModelNames.Counters) private readonly counterModel: Model<Counter>,
    private readonly cartService: CartService,
    private readonly settingsService: SettingsService,
    private readonly addressesService: AddressesService,
    private readonly userRepository: UserRepository,
    private readonly zoneRepository: DeliveryZoneRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly events: EventEmitter2,
  ) {}

  /** Resolves the delivery address: explicit one-off > saved id > default saved address. */
  private async resolveAddress(user: any, dto: CheckoutPreviewDto) {
    if (dto.address) {
      return this.addressesService.buildAddress({ ...dto.address, phone: dto.address.phone || user.phone });
    }
    const addresses: any[] = user.addresses ?? [];
    if (dto.addressId) {
      const found = addresses.find((a) => a._id?.toString() === dto.addressId);
      if (!found) throw new BadRequestException('Address not found');
      return found;
    }
    return addresses.find((a) => a.isDefault) ?? addresses[0];
  }

  /** Full price breakdown for the checkout screen (no side effects besides cart repricing). */
  async quote(userId: string, dto: CheckoutPreviewDto): Promise<CheckoutQuote & { _user: any; _cartDoc: any }> {
    const issues: string[] = [];
    const [user, restaurant, settings, { cart: cartDoc, priced }] = await Promise.all([
      this.userRepository.model.findById(userId).lean(),
      this.settingsService.getStatus(new Date(), true),
      this.settingsService.get(true),
      this.cartService.getPricedCartForCheckout(userId),
    ]);
    if (!user) throw new BadRequestException('User not found');

    if (!restaurant.isOpen) issues.push(restaurant.message!);
    // The coupon was dropped while repricing (expired/deleted): tell the customer
    // instead of silently charging the higher total.
    if (priced.couponError) issues.push(priced.couponError);
    if (!priced.cartItems.length) issues.push('Your cart is empty');
    if (priced.hasUnavailableItems) {
      issues.push('Some items in your cart are unavailable, please remove them to continue');
    }

    const address = await this.resolveAddress(user, dto);
    let zone: CheckoutQuote['zone'];
    if (!address) {
      issues.push('Please add a delivery address');
    } else if (!address.zone) {
      issues.push('Please update your address and choose your area');
    } else {
      const zoneDoc = await this.zoneRepository.findOne({ _id: address.zone, isActive: true });
      if (!zoneDoc) {
        issues.push('Sorry, we do not deliver to this area at the moment');
      } else {
        zone = {
          _id: zoneDoc._id.toString(),
          name: zoneDoc.name,
          nameAr: zoneDoc.nameAr,
          deliveryFee: zoneDoc.deliveryFee,
          minOrderAmount: zoneDoc.minOrderAmount ?? 0,
          estimatedDeliveryMinutes:
            zoneDoc.estimatedDeliveryMinutes || settings.defaultEstimatedDeliveryMinutes,
        };
        if (priced.subtotal < zone.minOrderAmount) {
          issues.push(
            `Minimum order for ${zone.name} is ${zone.minOrderAmount} EGP (add ${roundMoney(
              zone.minOrderAmount - priced.subtotal,
            )} EGP more)`,
          );
        }
      }
    }

    const afterCoupon = roundMoney(priced.subtotal - priced.couponDiscount);
    const taxPercentage = settings.taxPercentage ?? 0;
    const taxPrice = roundMoney((afterCoupon * taxPercentage) / 100);
    const deliveryFee = zone?.deliveryFee ?? 0;
    const itemsDiscount = roundMoney(
      priced.cartItems
        .filter((l) => l.isAvailable)
        .reduce((sum, l) => sum + (l.basePrice - l.price) * l.quantity, 0),
    );

    return {
      canPlaceOrder: issues.length === 0,
      issues,
      restaurant,
      cart: priced,
      address,
      zone,
      subtotal: priced.subtotal,
      couponDiscount: priced.couponDiscount,
      itemsDiscount,
      taxPercentage,
      taxPrice,
      deliveryFee,
      total: roundMoney(afterCoupon + taxPrice + deliveryFee),
      _user: user,
      _cartDoc: cartDoc,
    };
  }

  async preview(userId: string, dto: CheckoutPreviewDto) {
    const { _user, _cartDoc, ...quote } = await this.quote(userId, dto);
    return { status: 'success', data: quote };
  }

  private async nextOrderNumber(session: ClientSession): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { _id: 'orderNumber' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after', session },
    );
    return ORDER_NUMBER_START + counter!.seq;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const quote = await this.quote(userId, dto);
    if (!quote.canPlaceOrder) {
      throw new BadRequestException(quote.issues[0]);
    }

    const { _user: user, _cartDoc: cartDoc, cart, address, zone } = quote;
    const lines = cart.cartItems;

    const order = await this.connection.transaction(async (session) => {
      // Claim the exact cart version that was priced. A concurrent request (double
      // tap) or a cart edit in between makes this fail, so one cart = one order.
      // On a transaction retry the cart is already claimed and this throws too.
      const claimed = await this.cartService.claimCartForOrder(cartDoc._id, cartDoc.updatedAt, session);
      if (!claimed) {
        throw new BadRequestException('Your cart has changed or this order was already placed, please review your cart');
      }

      // Stock: enforce only for items that track it; always count sales.
      const tracked = await this.productRepository.model
        .find({ _id: { $in: lines.map((l) => l.product._id) }, trackStock: true })
        .select('_id')
        .session(session)
        .lean();
      const trackedIds = new Set(tracked.map((p) => p._id.toString()));

      for (const line of lines) {
        const id = line.product._id.toString();
        if (trackedIds.has(id)) {
          const res = await this.productRepository.model.updateOne(
            { _id: id, quantity: { $gte: line.quantity } },
            { $inc: { quantity: -line.quantity, sold: line.quantity } },
            { session },
          );
          if (res.modifiedCount === 0) {
            throw new BadRequestException(`Sorry, ${line.product.title} just ran out`);
          }
        } else {
          await this.productRepository.model.updateOne(
            { _id: id },
            { $inc: { sold: line.quantity } },
            { session },
          );
        }
      }

      const orderNumber = await this.nextOrderNumber(session);
      const now = new Date();
      const created = await this.orderRepository.create(
        {
          orderNumber,
          user: new Types.ObjectId(userId),
          customer: { name: user.name, phone: user.phone, email: user.email },
          cartItems: lines.map((l) => ({
            product: l.product._id,
            title: l.product.title,
            titleAr: l.product.titleAr,
            imageCover: l.product.imageCover,
            quantity: l.quantity,
            price: l.price,
            basePrice: l.basePrice,
            lineTotal: l.lineTotal,
            stockDeducted: trackedIds.has(l.product._id.toString()),
            notes: l.notes || undefined,
            promotion: l.promotion?._id,
          })) as any,
          subtotal: quote.subtotal,
          couponCode: cart.couponCode,
          couponDiscount: quote.couponDiscount,
          itemsDiscount: quote.itemsDiscount,
          taxPrice: quote.taxPrice,
          shippingPrice: quote.deliveryFee,
          totalOrderPrice: quote.total,
          deliveryZone: { _id: new Types.ObjectId(zone!._id), name: zone!.name, nameAr: zone!.nameAr },
          shippingAddress: {
            zone: new Types.ObjectId(zone!._id),
            alias: address!.alias,
            city: zone!.name,
            details: address!.details,
            building: address!.building,
            floor: address!.floor,
            apartment: address!.apartment,
            landmark: address!.landmark,
            phone: address!.phone || user.phone,
            postalCode: address!.postalCode,
            coordinates: address!.coordinates,
            locationUrl: address!.locationUrl,
          },
          paymentMethodType: 'cash',
          notes: dto.notes?.trim() || undefined,
          status: OrderStatus.PENDING,
          statusHistory: [{ status: OrderStatus.PENDING, at: now, by: new Types.ObjectId(userId), actor: 'customer' }],
          estimatedDeliveryMinutes: zone!.estimatedDeliveryMinutes,
        } as any,
        { session },
      );

      return created;
    });

    const plain = order.toObject();
    this.events.emit(OrderEvents.CREATED, { order: plain } satisfies OrderCreatedEvent);
    return plain;
  }
}
