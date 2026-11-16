import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** multipart/form-data sends arrays as "a,b" or '["a","b"]'. */
const toArray = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fall through */
  }
  return value.split(',').map((v) => v.trim()).filter(Boolean);
};

/** multipart/form-data sends booleans as strings. */
export const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : value;

export class CreateProductDto {
  @ApiProperty({ example: 'Classic Beef Burger' })
  @IsNotEmpty({ message: 'Product title is required' })
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @ApiPropertyOptional({ example: 'برجر لحم كلاسيك' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titleAr?: string;

  @ApiPropertyOptional({ example: '150g beef patty, cheddar, lettuce, tomato and house sauce' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'قطعة لحم 150 جرام مع شيدر وخس وطماطم وصوص البيت' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionAr?: string;

  @ApiProperty({ example: 150 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(200000)
  price: number;

  @ApiPropertyOptional({ example: 130, description: 'Permanent sale price (scheduled offers are managed from Promotions)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceAfterDiscount?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: false, default: false, description: 'Enforce and decrement `quantity` on orders' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  trackStock?: boolean;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Cover image file' })
  @IsOptional()
  @IsString()
  imageCover?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty({ message: 'Product must belong to category' })
  @IsMongoId({ message: 'Invalid category ID' })
  category: string;

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsMongoId({ each: true })
  subcategories?: string[];

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109cc' })
  @IsOptional()
  @IsMongoId({ message: 'Invalid brand ID' })
  brand?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  new?: boolean;
}
