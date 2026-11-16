import { Injectable } from '@nestjs/common';
import { SignupUseCase } from './use-cases/signup.usecase.js';
import { LoginUseCase } from './use-cases/login.usecase.js';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.usecase.js';
import { VerifyResetCodeUseCase } from './use-cases/verify-reset-code.usecase.js';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase.js';
import { SignupDto } from './dtos/signup.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ForgotPasswordDto } from './dtos/forgot-password.dto.js';
import { VerifyResetCodeDto } from './dtos/verify-reset-code.dto.js';
import { ResetPasswordDto } from './dtos/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly verifyResetCodeUseCase: VerifyResetCodeUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  signup(dto: SignupDto) {
    return this.signupUseCase.execute(dto);
  }

  login(dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  forgotPassword(dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  verifyResetCode(dto: VerifyResetCodeDto) {
    return this.verifyResetCodeUseCase.execute(dto);
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto);
  }
}
