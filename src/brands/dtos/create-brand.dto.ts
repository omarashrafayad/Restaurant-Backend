import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple' })
  @IsNotEmpty({ message: 'Brand required' })
  @IsString()
  @Length(3, 32, { message: 'Brand name must be between 3 and 32 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'apple.png' })
  @IsOptional()
  @IsString()
  image?: string;
}
