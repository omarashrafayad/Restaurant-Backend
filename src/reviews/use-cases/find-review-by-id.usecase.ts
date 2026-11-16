import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository.js';
import { ReviewResponseDto } from '../dtos/review-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindReviewByIdUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id, {
      populate: [
        { path: 'user', select: 'name _id' },
        { path: 'product', select: 'title _id' },
      ],
    });

    if (!review) {
      throw new NotFoundException(`No review found for id: ${id}`);
    }

    const obj = (review as any).toObject ? (review as any).toObject() : review;
    return plainToInstance(ReviewResponseDto, obj);
  }
}
