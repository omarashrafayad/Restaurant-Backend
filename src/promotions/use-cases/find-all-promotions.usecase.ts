import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';
import { PromotionResponseDto } from '../dtos/promotion-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllPromotionsUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<PromotionResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.title = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.promotionRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      populate: [
        { path: 'categories', select: 'name image' },
        { path: 'products', select: 'title price priceAfterDiscount imageCover' },
      ],
      lean: true,
    });

    return plainToInstance(PaginatedResult<PromotionResponseDto>, result);
  }
}
