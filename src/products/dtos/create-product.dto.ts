import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Apple iPhone 15 Pro' })
  @IsNotEmpty({ message: 'Product title is required' })
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @ApiProperty({ example: 'Latest Apple iPhone with titanium design and A17 pro chip' })
  @IsNotEmpty({ message: 'Product description is required' })
  @IsString()
  @Length(20, 2000, { message: 'Description must be between 20 and 2000 characters' })
  description: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sold?: number;

  @ApiProperty({ example: 1200 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(200000)
  price: number;

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

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty({ message: 'Product must belong to category' })
  @IsMongoId({ message: 'Invalid category ID' })
  category: string;

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
  @IsMongoId({ message: 'Invalid brand ID' })
  brand?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  new?: boolean;
}
