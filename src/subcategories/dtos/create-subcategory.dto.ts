import { IsMongoId, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubCategoryDto {
  @ApiProperty({ example: 'Mobile Phones' })
  @IsNotEmpty({ message: 'SubCategory name is required' })
  @IsString()
  @Length(2, 32, { message: 'SubCategory name must be between 2 and 32 characters' })
  name: string;

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId({ message: 'Invalid category ID format' })
  category?: string;
}
