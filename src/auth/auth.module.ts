import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Environment } from '../common/configuration/environment.interface.js';
import { UsersModule } from '../users/users.module.js';
import { MailModule } from '../mail/mail.module.js';
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => ({
        secret: configService.get<string>('jwtSecret') || 'secretKey',
        signOptions: {
          expiresIn: (configService.get<string>('accessTokenExpireIn') || '7d') as any,
        },
      }),
    }),
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
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
