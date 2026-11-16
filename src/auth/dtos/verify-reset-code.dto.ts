import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Reset code is required' })
  @Matches(/^\d{6}$/, { message: 'Reset code must be 6 digits' })
  resetCode: string;
}
