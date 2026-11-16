import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsNotEmpty({ message: 'Category required' })
  @IsString()
  @Length(3, 32, { message: 'Category name must be between 3 and 32 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'category.png' })
  @IsOptional()
  @IsString()
  image?: string;
}
