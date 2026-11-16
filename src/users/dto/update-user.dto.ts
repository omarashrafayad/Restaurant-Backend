import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EG_MOBILE_REGEX, normalizeEgMobile } from '../../common/utils/phone.util.js';
import { Roles } from '../../common/constants/roles.constant.js';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Omar Mahmoud' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @Matches(EG_MOBILE_REGEX, { message: 'Please enter a valid Egyptian mobile number' })
  @Transform(({ value }) => (typeof value === 'string' ? normalizeEgMobile(value) : value), { toClassOnly: true })
  phone?: string;

  @ApiPropertyOptional({ example: 'user.png' })
  @IsOptional()
  @IsString()
  profileImg?: string;

  @ApiPropertyOptional({ enum: Roles })
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
