import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSIONS_REVOKED } from '../../auth/auth.events.js';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../repository/user.repository.js';
import { ChangeMyPasswordDto, ChangePasswordDto } from '../dto/change-password.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { BCRYPT_ROUNDS } from '../../common/constants/auth.constant.js';
import { signAccessToken } from '../../auth/utils/token.util.js';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly events: EventEmitter2,
  ) {}

  private async setPassword(id: string, password: string) {
    // passwordChangedAt invalidates every token issued before it (see JwtAuthGuard).
    const updated = await this.userRepository.findByIdAndUpdate(id, {
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      passwordChangedAt: new Date(),
    });
    if (updated) this.events.emit(SESSIONS_REVOKED, { userId: id });
    return updated;
  }

  /** Admin flow: replaces the password and logs the user out everywhere. */
  async execute(id: string, dto: ChangePasswordDto): Promise<UserResponseDto> {
    const updated = await this.setPassword(id, dto.password);
    if (!updated) throw new NotFoundException(`No user found for id: ${id}`);
    return plainToInstance(UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
  }

  /** Self-service flow: requires the current password and returns a fresh token. */
  async changeMine(userId: string, dto: ChangeMyPasswordDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const user = await this.userRepository.model.findById(userId).select('+password');
    if (!user || !user.password) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const updated = await this.setPassword(userId, dto.password);
    return {
      message: 'Password changed successfully',
      data: plainToInstance(UserResponseDto, updated!.toObject(), { excludeExtraneousValues: true }),
      token: signAccessToken(this.jwtService, user),
    };
  }
}
