import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repository/user.repository.js';
import { VerifyResetCodeDto } from '../dtos/verify-reset-code.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import crypto from 'crypto';

@Injectable()
export class VerifyResetCodeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: VerifyResetCodeDto): Promise<{ status: string }> {
    const hashedResetCode = crypto.createHash('sha256').update(dto.resetCode).digest('hex');

    const user = await this.userRepository.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Reset code invalid or expired');
    }

    await this.userRepository.findByIdAndUpdate(user._id.toString(), {
      passwordResetVerified: true,
    });

    return {
      status: 'Success',
    };
  }
}
