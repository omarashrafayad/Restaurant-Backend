import { Injectable } from '@nestjs/common';
import { CartRepository } from './repository/cart.repository.js';
import { ProductRepository } from '../products/repository/product.repository.js';
import { CouponRepository } from '../coupons/repository/coupon.repository.js';
import { AddToCartDto } from './dtos/add-to-cart.dto.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly couponRepository: CouponRepository,
  ) {}

  private calcTotalCartPrice(cart: any): number {
    let totalPrice = 0;
    cart.cartItems.forEach((item: any) => {
      totalPrice += item.quantity * item.price;
    });
    cart.totalCartPrice = Number(totalPrice.toFixed(2));
    cart.totalPriceAfterDiscount = undefined;
    return cart.totalCartPrice;
  }

  async addProductToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartRepository.findOne({ user: userId as any });
    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    }

    const itemPrice =
      (product as any).priceAfterDiscount &&
      (product as any).priceAfterDiscount > 0 &&
      (product as any).priceAfterDiscount < (product as any).price
        ? (product as any).priceAfterDiscount
        : (product as any).price;

    const productIndex = (cart as any).cartItems.findIndex(
      (item: any) =>
        item.product?.toString() === dto.productId &&
        item.color === (dto.color || ''),
    );

    if (productIndex > -1) {
      (cart as any).cartItems[productIndex].quantity += 1;
      (cart as any).cartItems[productIndex].price = itemPrice;
    } else {
      (cart as any).cartItems.push({
        product: dto.productId,
        color: dto.color || '',
        price: itemPrice,
        quantity: 1,
      });
    }

    this.calcTotalCartPrice(cart);
    await (cart as any).save();

    return {
      status: 'success',
      message: 'Product added to cart successfully',
      numOfCartItems: (cart as any).cartItems.length,
      data: cart,
    };
  }

  async getLoggedUserCart(userId: string) {
    let cart = await this.cartRepository.model
      .findOne({ user: userId })
      .populate({
        path: 'cartItems.product',
        select: 'title imageCover price priceAfterDiscount',
      });

    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    }

    return {
      status: 'success',
      numOfCartItems: cart.cartItems.length,
      data: cart,
    };
  }

  async removeSpecificCartItem(userId: string, itemId: string) {
    let cart = await this.cartRepository.findOne({ user: userId as any });
    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    } else {
      (cart as any).cartItems = (cart as any).cartItems.filter(
        (item: any) => item._id?.toString() !== itemId,
      );
      this.calcTotalCartPrice(cart);
      await (cart as any).save();
    }

    return {
      status: 'success',
      numOfCartItems: (cart as any).cartItems.length,
      data: cart,
    };
  }

  async clearCart(userId: string) {
    let cart = await this.cartRepository.findOne({ user: userId as any });
    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    } else {
      (cart as any).cartItems = [];
      (cart as any).totalCartPrice = 0;
      (cart as any).totalPriceAfterDiscount = undefined;
      await (cart as any).save();
    }

    return {
      status: 'success',
      numOfCartItems: 0,
      data: cart,
    };
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
    let cart = await this.cartRepository.findOne({ user: userId as any });
    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    }

    const itemIndex = (cart as any).cartItems.findIndex(
      (item: any) => item._id?.toString() === itemId,
    );

    if (itemIndex > -1) {
      (cart as any).cartItems[itemIndex].quantity = quantity;
    } else {
      throw new NotFoundException(`There is no item for this id: ${itemId}`);
    }

    this.calcTotalCartPrice(cart);
    await (cart as any).save();

    return {
      status: 'success',
      numOfCartItems: (cart as any).cartItems.length,
      data: cart,
    };
  }

  async applyCoupon(userId: string, couponName: string) {
    const coupon = await this.couponRepository.findOne({
      name: couponName.toUpperCase().trim(),
      expire: { $gt: new Date() },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon is invalid or expired');
    }

    let cart = await this.cartRepository.findOne({ user: userId as any });
    if (!cart) {
      cart = await this.cartRepository.create({
        user: userId as any,
        cartItems: [],
        totalCartPrice: 0,
      });
    }

    const totalPrice = (cart as any).totalCartPrice;
    const totalPriceAfterDiscount = Number(
      (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2),
    );

    (cart as any).totalPriceAfterDiscount = totalPriceAfterDiscount;
    await (cart as any).save();

    return {
      status: 'success',
      numOfCartItems: (cart as any).cartItems.length,
      data: cart,
    };
  }

  async findById(cartId: string) {
    return this.cartRepository.findById(cartId, { lean: false });
  }

  async findByIdAndDelete(cartId: string) {
    return this.cartRepository.findByIdAndDelete(cartId);
  }
}
