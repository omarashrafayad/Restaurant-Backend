import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Reset code is required' })
  @IsString()
  @MinLength(6, { message: 'Reset code must be at least 6 characters' })
  resetCode: string;
}
