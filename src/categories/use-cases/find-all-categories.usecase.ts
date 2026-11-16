import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository.js';
import { CategoryResponseDto } from '../dtos/category-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<CategoryResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.name = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.categoryRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      lean: true,
    });

    return plainToInstance(PaginatedResult<CategoryResponseDto>, result);
  }
}
