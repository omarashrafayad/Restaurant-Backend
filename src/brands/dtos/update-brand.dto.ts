import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Apple' })
  @IsOptional()
  @IsString()
  @Length(3, 32)
  name?: string;

  @ApiPropertyOptional({ example: 'apple.png' })
  @IsOptional()
  @IsString()
  image?: string;
}
