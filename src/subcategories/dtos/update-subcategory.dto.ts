import { IsMongoId, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubCategoryDto {
  @ApiPropertyOptional({ example: 'Smartphones' })
  @IsOptional()
  @IsString()
  @Length(2, 32)
  name?: string;

  @ApiPropertyOptional({ example: '60d0fe4f5311236168a109ca' })
  @IsOptional()
  @IsMongoId()
  category?: string;
}
