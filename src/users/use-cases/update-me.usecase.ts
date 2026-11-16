import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { UpdateMeDto } from '../dto/update-me.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: UpdateMeDto): Promise<UserResponseDto> {
    if (dto.email) {
      const existing = await this.userRepository.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.userRepository.findByIdAndUpdate(userId, dto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    return plainToInstance(UserResponseDto, userObj, { excludeExtraneousValues: true });
  }
}
