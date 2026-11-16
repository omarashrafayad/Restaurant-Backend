import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository.js';
import { UpdateReviewDto } from '../dtos/update-review.dto.js';
import { ReviewResponseDto } from '../dtos/review-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(id: string, userId: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`No review found for id: ${id}`);
    }

    const reviewUserId = (review as any).user?._id?.toString() || (review as any).user?.toString();
    if (reviewUserId !== userId) {
      throw new ForbidenException('You are not allowed to perform this action');
    }

    const updated = await this.reviewRepository.findByIdAndUpdate(id, dto);
    const productId = (review as any).product?._id?.toString() || (review as any).product?.toString();
    await this.reviewRepository.calcAverageRatingsAndQuantity(productId);

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(ReviewResponseDto, obj);
  }
}
