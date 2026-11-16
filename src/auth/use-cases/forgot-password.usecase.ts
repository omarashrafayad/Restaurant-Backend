import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../users/repository/user.repository.js';
import { MailService } from '../../mail/mail.service.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ status: string; message: string }> {
    const user = await this.userRepository.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new NotFoundException(`There is no user with that email ${dto.email}`);
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    await this.userRepository.findByIdAndUpdate(user._id.toString(), {
      passwordResetCode: hashedResetCode,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      passwordResetVerified: false,
    });

    const message = `Hi ${user.name},\nWe received a request to reset the password on your E-shop Account.\n${resetCode}\nEnter this code to complete the reset.\nThanks for helping us keep your account secure.\nThe E-shop Team`;

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: 'Your password reset code (valid for 10 min)',
        message,
      });
    } catch (err: any) {
      this.logger.error(`Failed to send password reset email: ${err.message}`);
      // In local dev without SMTP creds, log the code for debugging
      this.logger.warn(`DEVELOPMENT RESET CODE FOR ${user.email}: ${resetCode}`);
    }

    return {
      status: 'Success',
      message: 'Reset code sent to email',
    };
  }
}
