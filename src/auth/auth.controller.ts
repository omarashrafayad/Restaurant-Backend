import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dtos/signup.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ForgotPasswordDto } from './dtos/forgot-password.dto.js';
import { VerifyResetCodeDto } from './dtos/verify-reset-code.dto.js';
import { ResetPasswordDto } from './dtos/reset-password.dto.js';
import { Public } from './decorator/public.decorator.js';
import {
  SignupSwagger,
  LoginSwagger,
  ForgotPasswordSwagger,
  VerifyResetCodeSwagger,
  ResetPasswordSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignupSwagger()
  @Public()
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @LoginSwagger()
  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ForgotPasswordSwagger()
  @Public()
  @Post('forgotPassword')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @VerifyResetCodeSwagger()
  @Public()
  @Post('verifyResetCode')
  async verifyResetCode(@Body() body: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(body);
  }

  @ResetPasswordSwagger()
  @Public()
  @Patch('resetPassword')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
