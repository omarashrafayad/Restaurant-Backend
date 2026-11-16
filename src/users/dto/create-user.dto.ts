import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EG_MOBILE_REGEX, normalizeEgMobile } from '../../common/utils/phone.util.js';
import { Roles } from '../../common/constants/roles.constant.js';

export class CreateUserDto {
  @ApiProperty({ example: 'Omar Mahmoud' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(3, { message: 'Too short User name' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @Matches(EG_MOBILE_REGEX, { message: 'Please enter a valid Egyptian mobile number' })
  @Transform(({ value }) => (typeof value === 'string' ? normalizeEgMobile(value) : value), { toClassOnly: true })
  phone?: string;

  @ApiPropertyOptional({ example: 'user.png' })
  @IsOptional()
  @IsString()
  profileImg?: string;

  @ApiPropertyOptional({ enum: Roles, default: Roles.USER })
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
