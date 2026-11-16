import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { WishlistService } from './wishlist.service.js';
import { AddToWishlistDto } from './dtos/add-to-wishlist.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';

@ApiTags(APi_TAGS.WISHLIST)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Add product to customer wishlist' })
  @ApiResponse({ status: 200, description: 'Product added to wishlist' })
  @Post()
  async addToWishlist(
    @CurrentAccount() principal: Principal,
    @Body() body: AddToWishlistDto,
  ) {
    return this.wishlistService.addToWishlist(principal.user._id, body.productId);
  }

  @ApiOperation({ summary: 'Remove product from customer wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @Delete(':productId')
  async removeFromWishlist(
    @CurrentAccount() principal: Principal,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(principal.user._id, productId);
  }

  @ApiOperation({ summary: 'Get logged in customer wishlist' })
  @ApiResponse({ status: 200, description: 'List of wishlist items' })
  @Get()
  async getLoggedUserWishlist(@CurrentAccount() principal: Principal) {
    return this.wishlistService.getLoggedUserWishlist(principal.user._id);
  }
}
