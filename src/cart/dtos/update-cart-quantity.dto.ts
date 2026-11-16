import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_ITEM_QUANTITY } from '../schema/cart.schema.js';

export class UpdateCartQuantityDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ITEM_QUANTITY)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Extra spicy' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
