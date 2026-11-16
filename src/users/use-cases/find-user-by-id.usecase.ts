import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    return plainToInstance(UserResponseDto, userObj, { excludeExtraneousValues: true });
  }
}
