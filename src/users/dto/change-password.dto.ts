import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Logged-in user changing their own password. */
export class ChangeMyPasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString()
  passwordConfirm: string;
}

/** Admin setting a new password for another account. */
export class ChangePasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  password: string;
}
