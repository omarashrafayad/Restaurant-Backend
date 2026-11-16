import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HHMM_REGEX } from '../../common/utils/time.util.js';

export class OpeningHoursDto {
  @ApiProperty({ example: 5, description: '0 = Sunday ... 6 = Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  day: number;

  @ApiProperty({ example: '12:00' })
  @Matches(HHMM_REGEX, { message: 'open must be HH:mm' })
  open: string;

  @ApiProperty({ example: '02:00', description: 'May be after midnight' })
  @Matches(HHMM_REGEX, { message: 'close must be HH:mm' })
  close: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Take Five' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: 'تيك فايف' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameAr?: string;

  @ApiPropertyOptional({ example: '01000000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '0225555555' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  secondaryPhone?: string;

  @ApiPropertyOptional({ example: '201000000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'Madinaty, B2 Mall' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  acceptingOrders?: boolean;

  @ApiPropertyOptional({ example: 'We are fully booked, back in 30 minutes' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pausedMessage?: string;

  @ApiPropertyOptional({ type: [OpeningHoursDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercentage?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowCustomerCancelWhilePending?: boolean;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(300)
  defaultEstimatedDeliveryMinutes?: number;

  @ApiPropertyOptional({ example: ['خارج نطاق التوصيل', 'لا يوجد مناديب متاحين حالياً'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  rejectionReasons?: string[];
}

export class ToggleOrdersDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  acceptingOrders: boolean;

  @ApiPropertyOptional({ example: 'Back in 30 minutes' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pausedMessage?: string;
}
