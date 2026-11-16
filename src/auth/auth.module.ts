import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AddressesModule } from '../addresses/addresses.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SignupUseCase } from './use-cases/signup.usecase.js';
import { LoginUseCase } from './use-cases/login.usecase.js';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.usecase.js';
import { VerifyResetCodeUseCase } from './use-cases/verify-reset-code.usecase.js';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    UsersModule,
    MailModule,
    AddressesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignupUseCase,
    LoginUseCase,
    ForgotPasswordUseCase,
    VerifyResetCodeUseCase,
    ResetPasswordUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
