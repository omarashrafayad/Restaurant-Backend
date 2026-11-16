import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckDeliveryFeeDto {
  @ApiProperty({ example: 'Madinaty' })
  @IsNotEmpty({ message: 'City name is required' })
  @IsString()
  city: string;
}
