import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty({ message: 'Product id is required' })
  @IsMongoId({ message: 'Invalid product id format' })
  productId: string;
}
