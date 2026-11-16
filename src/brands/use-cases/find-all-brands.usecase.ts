import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repository/brand.repository.js';
import { BrandResponseDto } from '../dtos/brand-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllBrandsUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<BrandResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.name = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.brandRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      lean: true,
    });

    return plainToInstance(PaginatedResult<BrandResponseDto>, result);
  }
}
