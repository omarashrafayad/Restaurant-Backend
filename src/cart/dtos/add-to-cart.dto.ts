import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_ITEM_QUANTITY } from '../schema/cart.schema.js';

export class AddToCartDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsMongoId({ message: 'Invalid product ID' })
  productId: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ITEM_QUANTITY)
  quantity?: number;

  @ApiPropertyOptional({ example: 'بدون بصل وبدون مشروم' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  color?: string;
}
