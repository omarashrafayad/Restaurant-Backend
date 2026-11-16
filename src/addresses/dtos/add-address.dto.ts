import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({ example: 'Street 10, Building 4' })
  @IsNotEmpty({ message: 'Address details are required' })
  @IsString()
  details: string;

  @ApiProperty({ example: '+201234567890' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Madinaty' })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: '11835' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: { lat: 30.0444, lng: 31.2357 } })
  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=30.0444,31.2357' })
  @IsOptional()
  @IsString()
  locationUrl?: string;
}
