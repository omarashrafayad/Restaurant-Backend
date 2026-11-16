import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repository/coupon.repository.js';
import { CouponResponseDto } from '../dtos/coupon-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllCouponsUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<CouponResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.name = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.couponRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      lean: true,
    });

    return plainToInstance(PaginatedResult<CouponResponseDto>, result);
  }
}
