import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartRepository } from './repository/cart.repository.js';
import { ProductRepository } from '../products/repository/product.repository.js';
import { CouponRepository } from '../coupons/repository/coupon.repository.js';
import { PricingService } from '../pricing/pricing.service.js';
import { AddToCartDto } from './dtos/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dtos/update-cart-quantity.dto.js';
import { CartDocument, MAX_ITEM_QUANTITY } from './schema/cart.schema.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { roundMoney } from '../common/utils/money.util.js';
import { ProductPrice } from '../pricing/pricing.types.js';

const PRODUCT_FIELDS =
  'title titleAr imageCover price priceAfterDiscount category isAvailable trackStock quantity';

export interface PricedCartLine {
  _id: string;
  product: any;
  quantity: number;
  notes: string;
  /** Unit price the customer pays now. */
  price: number;
  /** Unit menu price before discounts. */
  basePrice: number;
  lineTotal: number;
  promotion?: ProductPrice['promotion'];
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface PricedCart {
  _id: string;
  user: string;
  cartItems: PricedCartLine[];
  couponCode?: string;
  couponDiscountPercentage?: number;
  couponError?: string;
  /** Sum of available lines (after item promotions, before coupon). */
  subtotal: number;
  couponDiscount: number;
  /** Kept for backwards compatibility: equals subtotal. */
  totalCartPrice: number;
  /** subtotal - couponDiscount (delivery fee is added at checkout). */
  totalPriceAfterDiscount: number;
  hasUnavailableItems: boolean;
  updatedAt?: Date;
}

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly couponRepository: CouponRepository,
    private readonly pricingService: PricingService,
  ) {}

  /** Hydrated cart for the user, created on first use (atomic upsert). */
  private async getOrCreate(userId: string): Promise<CartDocument> {
    const cart = await this.cartRepository.model.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $setOnInsert: { user: new Types.ObjectId(userId), cartItems: [], totalCartPrice: 0 } },
      { upsert: true, returnDocument: 'after' },
    );
    return cart as unknown as CartDocument;
  }

  /**
   * Re-prices every line with the current menu prices / promotions, validates
   * the coupon and persists the refreshed totals. Everything the customer sees
   * and everything checkout charges comes from here.
   */
  async priceCart(cart: CartDocument): Promise<PricedCart> {
    const productIds = cart.cartItems.map((i) => i.product);
    const products = await this.productRepository.model
      .find({ _id: { $in: productIds } })
      .select(PRODUCT_FIELDS)
      .lean();
    const byId = new Map(products.map((p: any) => [p._id.toString(), p]));
    const prices = await this.pricingService.priceProducts(products as any);

    const lines: PricedCartLine[] = cart.cartItems.map((item) => {
      const product = byId.get(item.product.toString());
      const price = product ? prices.get(product._id.toString()) : undefined;

      let unavailableReason: string | undefined;
      if (!product) unavailableReason = 'This item is no longer on the menu';
      else if (!product.isAvailable) unavailableReason = 'This item is currently unavailable';
      else if (product.trackStock && product.quantity < item.quantity) {
        unavailableReason = `Only ${product.quantity} left`;
      }

      const unit = price?.finalPrice ?? item.price;
      if (price) item.price = unit;
      return {
        _id: item._id!.toString(),
        product: product
          ? {
              _id: product._id,
              title: product.title,
              titleAr: product.titleAr,
              imageCover: product.imageCover,
              price: product.price,
            }
          : { _id: item.product },
        quantity: item.quantity,
        notes: item.notes ?? '',
        price: unit,
        basePrice: price?.basePrice ?? unit,
        lineTotal: roundMoney(unit * item.quantity),
        promotion: price?.promotion,
        isAvailable: !unavailableReason,
        unavailableReason,
      };
    });

    const subtotal = roundMoney(
      lines.filter((l) => l.isAvailable).reduce((sum, l) => sum + l.lineTotal, 0),
    );

    let couponDiscount = 0;
    let couponDiscountPercentage: number | undefined;
    let couponError: string | undefined;
    if (cart.couponCode) {
      const coupon = await this.couponRepository.findOne({
        name: cart.couponCode,
        expire: { $gt: new Date() },
      });
      if (coupon) {
        couponDiscountPercentage = coupon.discount;
        couponDiscount = roundMoney((subtotal * coupon.discount) / 100);
      } else {
        couponError = 'Coupon is invalid or expired and was removed';
        cart.couponCode = undefined;
      }
    }

    const total = roundMoney(subtotal - couponDiscount);
    cart.totalCartPrice = subtotal;
    cart.totalPriceAfterDiscount = cart.couponCode ? total : undefined;
    if (cart.isModified()) await cart.save();

    return {
      _id: cart._id.toString(),
      user: cart.user.toString(),
      cartItems: lines,
      couponCode: cart.couponCode,
      couponDiscountPercentage,
      couponError,
      subtotal,
      couponDiscount,
      totalCartPrice: subtotal,
      totalPriceAfterDiscount: total,
      hasUnavailableItems: lines.some((l) => !l.isAvailable),
      updatedAt: cart.updatedAt,
    };
  }

  private async respond(cart: CartDocument, message?: string) {
    const data = await this.priceCart(cart);
    return {
      status: 'success',
      ...(message && { message }),
      numOfCartItems: data.cartItems.length,
      data,
    };
  }

  async getLoggedUserCart(userId: string) {
    return this.respond(await this.getOrCreate(userId));
  }

  /** Same product with the same notes is merged into one line. */
  async addProductToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepository.model
      .findById(dto.productId)
      .select(PRODUCT_FIELDS)
      .lean();
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isAvailable) throw new BadRequestException('This item is currently unavailable');

    const cart = await this.getOrCreate(userId);
    const notes = dto.notes?.trim() ?? '';
    const quantity = dto.quantity ?? 1;
    const existing = cart.cartItems.find(
      (i) => i.product.toString() === dto.productId && (i.notes ?? '') === notes,
    );

    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > MAX_ITEM_QUANTITY) {
      throw new BadRequestException(`Maximum quantity per item is ${MAX_ITEM_QUANTITY}`);
    }
    if (product.trackStock && product.quantity < newQuantity) {
      throw new BadRequestException(`Only ${product.quantity} left of this item`);
    }

    const { finalPrice } = await this.pricingService.priceProduct(product as any);
    if (existing) {
      existing.quantity = newQuantity;
    } else {
      cart.cartItems.push({
        product: product._id,
        quantity,
        notes,
        color: dto.color,
        price: finalPrice,
      });
    }
    await cart.save();
    return this.respond(cart, 'Product added to cart successfully');
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartQuantityDto) {
    if (dto.quantity === undefined && dto.notes === undefined) {
      throw new BadRequestException('Nothing to update (quantity or notes required)');
    }
    const cart = await this.getOrCreate(userId);
    const item = cart.cartItems.find((i) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundException(`There is no item for this id: ${itemId}`);

    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.notes !== undefined) item.notes = dto.notes.trim();
    await cart.save();
    return this.respond(cart);
  }

  async removeSpecificCartItem(userId: string, itemId: string) {
    const cart = await this.getOrCreate(userId);
    cart.cartItems = cart.cartItems.filter((i) => i._id?.toString() !== itemId) as any;
    await cart.save();
    return this.respond(cart);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreate(userId);
    cart.cartItems = [] as any;
    cart.couponCode = undefined;
    await cart.save();
    return this.respond(cart);
  }

  async applyCoupon(userId: string, couponName: string) {
    const code = couponName.toUpperCase().trim();
    const coupon = await this.couponRepository.findOne({ name: code, expire: { $gt: new Date() } });
    if (!coupon) throw new BadRequestException('Coupon is invalid or expired');

    const cart = await this.getOrCreate(userId);
    if (!cart.cartItems.length) throw new BadRequestException('Your cart is empty');
    cart.couponCode = code;
    await cart.save();
    return this.respond(cart, 'Coupon applied successfully');
  }

  async removeCoupon(userId: string) {
    const cart = await this.getOrCreate(userId);
    cart.couponCode = undefined;
    await cart.save();
    return this.respond(cart);
  }

  /** Used by checkout: the user's own cart, freshly priced. */
  async getPricedCartForCheckout(userId: string) {
    const cart = await this.getOrCreate(userId);
    return { cart, priced: await this.priceCart(cart) };
  }

  /**
   * Atomically empties the cart only if it is still the version that was
   * priced (same updatedAt, not empty). Returns null when it changed.
   */
  async claimCartForOrder(cartId: Types.ObjectId, updatedAt: Date | undefined, session: any) {
    return this.cartRepository.model.findOneAndUpdate(
      { _id: cartId, updatedAt, 'cartItems.0': { $exists: true } },
      { $set: { cartItems: [], totalCartPrice: 0 }, $unset: { couponCode: 1, totalPriceAfterDiscount: 1 } },
      { session, returnDocument: 'after' },
    );
  }

  /** Used after a successful checkout. */
  async emptyCart(userId: string, session?: any) {
    await this.cartRepository.model.updateOne(
      { user: new Types.ObjectId(userId) },
      { $set: { cartItems: [], totalCartPrice: 0 }, $unset: { couponCode: 1, totalPriceAfterDiscount: 1 } },
      { session },
    );
  }
}
