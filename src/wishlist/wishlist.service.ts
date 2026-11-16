import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repository/user.repository.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class WishlistService {
  constructor(private readonly userRepository: UserRepository) {}

  async addToWishlist(userId: string, productId: string) {
    const user = await this.userRepository.findByIdAndUpdate(
      userId,
      {
        $addToSet: { wishlist: productId as any },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'success',
      message: 'Product added successfully to your wishlist.',
      data: user.wishlist,
    };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const user = await this.userRepository.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: productId as any },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'success',
      message: 'Product removed successfully from your wishlist.',
      data: user.wishlist,
    };
  }

  async getLoggedUserWishlist(userId: string) {
    const user = await this.userRepository.model
      .findById(userId)
      .populate({
        path: 'wishlist',
        select: '_id title price imageCover quantity',
      });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 'success',
      results: user.wishlist?.length || 0,
      data: user.wishlist || [],
    };
  }
}
