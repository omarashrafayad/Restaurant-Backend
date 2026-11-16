import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';
import { containsRegex } from '../../common/utils/regex.util.js';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: PaginationDto): Promise<PaginatedResult<UserResponseDto>> {
    const filterQuery: Record<string, any> = {};

    if (query.keyword) {
      filterQuery.$or = [
        { name: containsRegex(query.keyword) },
        { email: containsRegex(query.keyword) },
        { phone: containsRegex(query.keyword) },
      ];
    }

    const result = await this.userRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      lean: true,
    });

    // Map every row through the response DTO so internal fields never leak.
    result.data = result.data.map((u) =>
      plainToInstance(UserResponseDto, u, { excludeExtraneousValues: true }),
    ) as any;
    return result as unknown as PaginatedResult<UserResponseDto>;
  }
}
