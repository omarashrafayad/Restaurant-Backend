import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyQuickDiscountDto {
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

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'] })
  @IsOptional()
  @IsArray()
  productIds?: string[];
}

export class RemoveQuickDiscountDto {
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
  productIds?: string[];
}
