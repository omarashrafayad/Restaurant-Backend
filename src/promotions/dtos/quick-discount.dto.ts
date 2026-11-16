import { IsArray, IsDateString, IsIn, IsMongoId, IsNumber, IsOptional, Max, Min, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** One-tap discount starting now (creates a promotion behind the scenes). */
export class ApplyQuickDiscountDto {
  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  discountPercentage: number;

  @ApiPropertyOptional({ enum: ['all', 'category', 'products'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'category', 'products'])
  target?: 'all' | 'category' | 'products';

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ example: '2026-11-16T23:59:00.000Z', description: 'When it ends (default: end of today)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'خصم النهارده' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;
}

export class RemoveQuickDiscountDto {
  @ApiPropertyOptional({ enum: ['all', 'category', 'products'] })
  @IsOptional()
  @IsIn(['all', 'category', 'products'])
  target?: 'all' | 'category' | 'products';

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productIds?: string[];
}
