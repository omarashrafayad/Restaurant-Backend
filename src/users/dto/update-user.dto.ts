import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @IsString()
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
