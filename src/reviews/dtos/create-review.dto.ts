import { Max, Min, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiPropertyOptional({ example: 'Great product!' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty({ message: 'Ratings value is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Min ratings value is 1.0' })
  @Max(5, { message: 'Max ratings value is 5.0' })
  ratings: number;

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId({ message: 'Invalid product ID format' })
  product?: string;
}
