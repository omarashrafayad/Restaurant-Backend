import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePromotionDto {
  @ApiPropertyOptional({ example: 'Summer Special Deals' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '25% off' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ enum: ['all', 'category', 'products'] })
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

  @ApiPropertyOptional({ example: [5, 6] })
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
