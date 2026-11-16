import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/repository/user.repository.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new NotFoundException(`There is no user with email ${dto.email}`);
    }

    if (!user.passwordResetVerified) {
      throw new BadRequestException('Reset code not verified');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.userRepository.findByIdAndUpdate(user._id.toString(), {
      password: hashedPassword,
      $unset: {
        passwordResetCode: 1,
        passwordResetExpires: 1,
        passwordResetVerified: 1,
      },
      passwordChangedAt: new Date(),
    });

    const userId = user._id.toString();
    const token = this.jwtService.sign({
      userId,
      _id: userId,
      role: user.role,
    });

    return { token };
  }
}
