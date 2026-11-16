import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dtos/add-to-cart.dto.js';
import { UpdateCartQuantityDto } from './dtos/update-cart-quantity.dto.js';
import { ApplyCouponDto } from './dtos/apply-coupon.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';

@ApiTags(APi_TAGS.CART)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Add product to shopping cart' })
  @ApiResponse({ status: 200, description: 'Product added to cart successfully' })
  @Post()
  async addProductToCart(
    @CurrentAccount() principal: Principal,
    @Body() body: AddToCartDto,
  ) {
    return this.cartService.addProductToCart(principal.user._id, body);
  }

  @ApiOperation({ summary: 'Get logged in customer shopping cart' })
  @ApiResponse({ status: 200, description: 'Customer shopping cart returned' })
  @Get()
  async getLoggedUserCart(@CurrentAccount() principal: Principal) {
    return this.cartService.getLoggedUserCart(principal.user._id);
  }

  @ApiOperation({ summary: 'Clear all items from shopping cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @Delete()
  async clearCart(@CurrentAccount() principal: Principal) {
    return this.cartService.clearCart(principal.user._id);
  }

  @ApiOperation({ summary: 'Apply discount coupon to shopping cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  @Patch('applyCoupon')
  async applyCoupon(
    @CurrentAccount() principal: Principal,
    @Body() body: ApplyCouponDto,
  ) {
    return this.cartService.applyCoupon(principal.user._id, body.coupon);
  }

  @ApiOperation({ summary: 'Remove the applied coupon' })
  @Delete('applyCoupon')
  async removeCoupon(@CurrentAccount() principal: Principal) {
    return this.cartService.removeCoupon(principal.user._id);
  }

  @ApiOperation({ summary: 'Update quantity and/or kitchen notes of a cart item' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @Patch(':itemId')
  async updateCartItem(
    @CurrentAccount() principal: Principal,
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateCartItem(principal.user._id, itemId, body);
  }

  @ApiOperation({ summary: 'Remove a specific item from shopping cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @Delete(':itemId')
  async removeSpecificCartItem(
    @CurrentAccount() principal: Principal,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeSpecificCartItem(principal.user._id, itemId);
  }
}
