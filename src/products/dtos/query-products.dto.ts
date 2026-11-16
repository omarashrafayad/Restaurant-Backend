import { IsBoolean, IsIn, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { toBoolean } from './create-product.dto.js';

const SORTABLE = ['price', '-price', 'createdAt', '-createdAt', 'sold', '-sold', 'ratingsAverage', '-ratingsAverage', 'title', '-title'];

/** Whitelisted catalogue filters (replaces the raw req.query pass-through). */
export class QueryProductsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Return every item (menu screen)', example: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  ignoreLimit?: boolean;

  @ApiPropertyOptional({ enum: SORTABLE, example: '-sold' })
  @IsOptional()
  @IsIn(SORTABLE)
  sort?: string;

  @ApiPropertyOptional({ description: 'Search in title / Arabic title / description' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subcategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  brand?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Customers only see available items unless this is false (staff)', example: true })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  available?: boolean;
}
