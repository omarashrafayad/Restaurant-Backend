import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository.js';
import { ReviewResponseDto } from '../dtos/review-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(
    query: PaginationDto,
    productIdParam?: string,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (productIdParam) {
      filterQuery.product = productIdParam;
    }

    const result = await this.reviewRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      populate: [
        { path: 'user', select: 'name _id' },
        { path: 'product', select: 'title _id' },
      ],
      lean: true,
    });

    return plainToInstance(PaginatedResult<ReviewResponseDto>, result);
  }
}
