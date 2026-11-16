import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository.js';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { CreateReviewDto } from '../dtos/create-review.dto.js';
import { ReviewResponseDto } from '../dtos/review-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateReviewDto,
    productIdParam?: string,
  ): Promise<ReviewResponseDto> {
    const productId = dto.product || productIdParam;
    if (!productId) {
      throw new BadRequestException('Product is required');
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('There is no product with this id');
    }

    const existingReview = await this.reviewRepository.findOne({
      user: userId as any,
      product: productId as any,
    });

    if (existingReview) {
      throw new BadRequestException('You already created a review for this product');
    }

    const review = await this.reviewRepository.create({
      title: dto.title,
      ratings: dto.ratings,
      user: userId as any,
      product: productId as any,
    });

    await this.reviewRepository.calcAverageRatingsAndQuantity(productId);

    const obj = (review as any).toObject ? (review as any).toObject() : review;
    return plainToInstance(ReviewResponseDto, obj);
  }
}
