import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { DeliveryZoneResponseDto } from '../dtos/delivery-zone-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllDeliveryZonesUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<DeliveryZoneResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.$or = [
        { name: { $regex: query.keyword, $options: 'i' } },
        { nameAr: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    const result = await this.zoneRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      lean: true,
    });

    return plainToInstance(PaginatedResult<DeliveryZoneResponseDto>, result);
  }
}
