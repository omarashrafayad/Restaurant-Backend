import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Apple iPhone 15 Pro' })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @Length(20, 2000)
  description?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sold?: number;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(200000)
  price?: number;

  @ApiPropertyOptional({ example: 999 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceAfterDiscount?: number;

  @ApiPropertyOptional({ example: ['Black', 'Silver'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(',').map((v) => v.trim());
      }
      return [value];
    }
    return value;
  })
  @IsArray()
  colors?: string[];

  @ApiPropertyOptional({ example: 'cover.jpg' })
  @IsOptional()
  @IsString()
  imageCover?: string;

  @ApiPropertyOptional({ example: ['img1.jpg', 'img2.jpg'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(',').map((v) => v.trim());
      }
      return [value];
    }
    return value;
  })
  @IsArray()
  subcategories?: string[];

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109cc' })
  @IsOptional()
  @IsMongoId()
  brand?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  new?: boolean;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ratingsAverage?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ratingsQuantity?: number;
}
