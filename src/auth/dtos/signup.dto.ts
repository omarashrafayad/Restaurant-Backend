import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '../../users/dto/address.dto.js';
import { EG_MOBILE_REGEX, normalizeEgMobile } from '../../common/utils/phone.util.js';

export class SignupDto {
  @ApiProperty({ example: 'Omar Mahmoud' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(3, { message: 'Too short User name' })
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  password: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @IsString()
  passwordConfirm?: string;

  @ApiProperty({ example: '01012345678' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(EG_MOBILE_REGEX, { message: 'Please enter a valid Egyptian mobile number' })
  @Transform(({ value }) => (typeof value === 'string' ? normalizeEgMobile(value) : value), {
    toClassOnly: true,
  })
  phone: string;

  @ApiPropertyOptional({ type: AddressDto, description: 'Optional first delivery address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
