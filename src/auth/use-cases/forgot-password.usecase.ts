import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';
import { UserRepository } from '../../users/repository/user.repository.js';
import { MailService } from '../../mail/mail.service.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { RESET_CODE_TTL_MINUTES } from '../../common/constants/auth.constant.js';

export const hashResetCode = (code: string) =>
  crypto.createHash('sha256').update(code).digest('hex');

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ status: string; message: string }> {
    // Same response whether the email exists or not (prevents account enumeration).
    const response = {
      status: 'success',
      message: 'If an account exists for this email, a reset code has been sent',
    };

    const user = await this.userRepository.findOne({ email: dto.email.toLowerCase().trim() });
    if (!user || !user.active) return response;

    const resetCode = crypto.randomInt(100000, 1000000).toString();

    await this.userRepository.findByIdAndUpdate(user._id.toString(), {
      passwordResetCode: hashResetCode(resetCode),
      passwordResetExpires: new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000),
      passwordResetVerified: false,
      passwordResetAttempts: 0,
    });

    // Fire-and-forget so response time does not reveal whether the account exists.
    this.mailService
      .sendEmail({
        email: user.email,
        subject: `Your Take Five password reset code (valid for ${RESET_CODE_TTL_MINUTES} min)`,
        message:
          `Hi ${user.name},\n\n` +
          `We received a request to reset the password of your Take Five account.\n\n` +
          `Your code: ${resetCode}\n\n` +
          `If you did not request this, you can safely ignore this email.\n\nTake Five Team`,
      })
      .catch((err: Error) => {
        this.logger.error(`Failed to send password reset email: ${err.message}`);
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn(`DEV ONLY - reset code for ${user.email}: ${resetCode}`);
        }
      });

    return response;
  }
}
