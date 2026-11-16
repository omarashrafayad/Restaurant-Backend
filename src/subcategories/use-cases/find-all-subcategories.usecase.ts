import { Injectable } from '@nestjs/common';
import { SubCategoryRepository } from '../repository/subcategory.repository.js';
import { SubCategoryResponseDto } from '../dtos/subcategory-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllSubCategoriesUseCase {
  constructor(private readonly subCategoryRepository: SubCategoryRepository) {}

  async execute(
    query: PaginationDto,
    categoryId?: string,
  ): Promise<PaginatedResult<SubCategoryResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (categoryId) {
      filterQuery.category = categoryId;
    }

    if (query.keyword) {
      filterQuery.name = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.subCategoryRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      populate: { path: 'category', select: 'name image' },
      lean: true,
    });

    return plainToInstance(PaginatedResult<SubCategoryResponseDto>, result);
  }
}
