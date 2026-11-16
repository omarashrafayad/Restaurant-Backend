import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repository/user.repository.js';
import { VerifyResetCodeDto } from '../dtos/verify-reset-code.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { RESET_CODE_MAX_ATTEMPTS } from '../../common/constants/auth.constant.js';
import { hashResetCode } from './forgot-password.usecase.js';

@Injectable()
export class VerifyResetCodeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Validates the code for the given email. Shared by the verify and reset
   * steps; every wrong guess counts against RESET_CODE_MAX_ATTEMPTS.
   */
  async assertValidCode(email: string, code: string) {
    const invalid = new BadRequestException('Reset code is invalid or expired');

    // Count the attempt atomically *before* comparing, so parallel guesses can
    // never exceed RESET_CODE_MAX_ATTEMPTS.
    const user = await this.userRepository.model
      .findOneAndUpdate(
        {
          email: email.toLowerCase().trim(),
          passwordResetCode: { $exists: true },
          passwordResetExpires: { $gt: new Date() },
          passwordResetAttempts: { $lt: RESET_CODE_MAX_ATTEMPTS },
        },
        { $inc: { passwordResetAttempts: 1 } },
        { returnDocument: 'after' },
      )
      .select('+passwordResetCode +passwordResetExpires +passwordResetAttempts +passwordResetVerified');

    if (!user) {
      const locked = await this.userRepository.model.exists({
        email: email.toLowerCase().trim(),
        passwordResetExpires: { $gt: new Date() },
        passwordResetAttempts: { $gte: RESET_CODE_MAX_ATTEMPTS },
      });
      throw locked ? new BadRequestException('Too many wrong attempts, please request a new code') : invalid;
    }

    if (user.passwordResetCode !== hashResetCode(code)) throw invalid;

    // Correct code: the counter only limits wrong guesses.
    await this.userRepository.model.updateOne({ _id: user._id }, { $set: { passwordResetAttempts: 0 } });
    return user;
  }

  async execute(dto: VerifyResetCodeDto): Promise<{ status: string }> {
    const user = await this.assertValidCode(dto.email, dto.resetCode);
    await this.userRepository.model.updateOne(
      { _id: user._id },
      { passwordResetVerified: true },
    );
    return { status: 'success' };
  }
}
