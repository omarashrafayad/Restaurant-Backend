import { Injectable } from '@nestjs/common';
import { CreateReviewUseCase } from './use-cases/create-review.usecase.js';
import { FindAllReviewsUseCase } from './use-cases/find-all-reviews.usecase.js';
import { FindReviewByIdUseCase } from './use-cases/find-review-by-id.usecase.js';
import { UpdateReviewUseCase } from './use-cases/update-review.usecase.js';
import { DeleteReviewUseCase } from './use-cases/delete-review.usecase.js';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { ReviewRepository } from './repository/review.repository.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly findAllReviewsUseCase: FindAllReviewsUseCase,
    private readonly findReviewByIdUseCase: FindReviewByIdUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  create(userId: string, dto: CreateReviewDto, productId?: string) {
    return this.createReviewUseCase.execute(userId, dto, productId);
  }

  findAll(query: PaginationDto, productId?: string) {
    return this.findAllReviewsUseCase.execute(query, productId);
  }

  findById(id: string) {
    return this.findReviewByIdUseCase.execute(id);
  }

  update(id: string, userId: string, dto: UpdateReviewDto) {
    return this.updateReviewUseCase.execute(id, userId, dto);
  }

  delete(id: string, userId: string, role: string) {
    return this.deleteReviewUseCase.execute(id, userId, role);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.reviewRepository.find(filter, options);
  }
}
