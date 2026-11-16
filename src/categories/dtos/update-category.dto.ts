import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  @Length(3, 32)
  name?: string;

  @ApiPropertyOptional({ example: 'category.png' })
  @IsOptional()
  @IsString()
  image?: string;
}
