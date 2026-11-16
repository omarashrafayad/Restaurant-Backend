import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSIONS_REVOKED } from '../auth.events.js';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../../users/repository/user.repository.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { BCRYPT_ROUNDS } from '../../common/constants/auth.constant.js';
import { VerifyResetCodeUseCase } from './verify-reset-code.usecase.js';
import { signAccessToken } from '../utils/token.util.js';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verifyResetCode: VerifyResetCodeUseCase,
    private readonly jwtService: JwtService,
    private readonly events: EventEmitter2,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ status: string; token: string }> {
    const user = await this.verifyResetCode.assertValidCode(dto.email, dto.resetCode);
    if (!user.passwordResetVerified) {
      throw new BadRequestException('Reset code not verified');
    }

    await this.userRepository.model.updateOne(
      { _id: user._id },
      {
        password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS),
        passwordChangedAt: new Date(),
        $unset: {
          passwordResetCode: 1,
          passwordResetExpires: 1,
          passwordResetVerified: 1,
          passwordResetAttempts: 1,
        },
      },
    );

    this.events.emit(SESSIONS_REVOKED, { userId: user._id.toString() });
    return { status: 'success', token: signAccessToken(this.jwtService, user) };
  }
}
