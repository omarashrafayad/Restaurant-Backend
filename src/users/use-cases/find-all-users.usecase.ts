import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<UserResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.$or = [
        { name: { $regex: query.keyword, $options: 'i' } },
        { email: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    const result = await this.userRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      fields: query.fields,
      lean: true,
    });

    return plainToInstance(PaginatedResult<UserResponseDto>, result);
  }
}
