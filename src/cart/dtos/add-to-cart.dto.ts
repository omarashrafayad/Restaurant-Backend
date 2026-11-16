import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsMongoId({ message: 'Invalid product ID' })
  productId: string;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  color?: string;
}
