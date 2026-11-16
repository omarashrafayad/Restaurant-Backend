import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, dto: ChangePasswordDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id, { lean: false });
    if (!user) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }

    if (dto.currentPassword) {
      const isMatch = await bcrypt.compare(dto.currentPassword, (user as any).password);
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const updated = await this.userRepository.findByIdAndUpdate(id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    const userObj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(UserResponseDto, userObj, { excludeExtraneousValues: true });
  }
}
