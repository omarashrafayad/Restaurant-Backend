import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Special Deals' })
  @IsNotEmpty({ message: 'Promotion title is required' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '20% off all main dishes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 20 })
  @IsNotEmpty({ message: 'Discount percentage is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @ApiPropertyOptional({ enum: ['all', 'category', 'products'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'category', 'products'])
  target?: 'all' | 'category' | 'products';

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109ca'] })
  @IsOptional()
  @IsArray()
  categories?: string[];

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @IsArray()
  products?: string[];

  @ApiPropertyOptional({ example: [5, 6], description: 'Days of week (0=Sun, 1=Mon...)' })
  @IsOptional()
  @IsArray()
  daysOfWeek?: number[];

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
