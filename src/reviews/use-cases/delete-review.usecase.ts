import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';
import { Roles } from '../../common/constants/roles.constant.js';

@Injectable()
export class DeleteReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(id: string, userId: string, role: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`No review found for id: ${id}`);
    }

    const reviewUserId = (review as any).user?._id?.toString() || (review as any).user?.toString();
    if (role === Roles.USER && reviewUserId !== userId) {
      throw new ForbidenException('You are not allowed to perform this action');
    }

    const productId = (review as any).product?._id?.toString() || (review as any).product?.toString();
    await this.reviewRepository.findByIdAndDelete(id);
    await this.reviewRepository.calcAverageRatingsAndQuantity(productId);
  }
}
