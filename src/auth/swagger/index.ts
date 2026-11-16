import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SignupDto } from '../dtos/signup.dto.js';
import { LoginDto } from '../dtos/login.dto.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { VerifyResetCodeDto } from '../dtos/verify-reset-code.dto.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';

export function SignupSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new customer account' }),
    ApiBody({ type: SignupDto }),
    ApiResponse({ status: 201, type: AuthResponseDto }),
    ApiResponse({ status: 400, description: 'Email already exists / validation error' }),
  );
}

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Log in to account' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({ status: 200, type: AuthResponseDto }),
    ApiResponse({ status: 401, description: 'Incorrect email or password' }),
  );
}

export function ForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Request password reset code via email' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({ status: 200, description: 'Reset code sent to email' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function VerifyResetCodeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify received password reset code' }),
    ApiBody({ type: VerifyResetCodeDto }),
    ApiResponse({ status: 200, description: 'Reset code verified' }),
    ApiResponse({ status: 400, description: 'Reset code invalid or expired' }),
  );
}

export function ResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Set new password using verified reset code' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({ status: 200, description: 'Password reset successful, new token returned' }),
    ApiResponse({ status: 400, description: 'Reset code not verified' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
