import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSIONS_REVOKED } from '../../auth/auth.events.js';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    if (dto.email) {
      const existing = await this.userRepository.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.userRepository.findByIdAndUpdate(id, dto);
    if (!updatedUser) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }
    this.events.emit(SESSIONS_REVOKED, { userId: id });

    const userObj = (updatedUser as any).toObject ? (updatedUser as any).toObject() : updatedUser;
    return plainToInstance(UserResponseDto, userObj, { excludeExtraneousValues: true });
  }
}
