import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ example: 30.0444 })
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 31.2357 })
  @Type(() => Number)
  @IsLongitude()
  lng: number;
}

/** Delivery address. `zone` comes from GET /delivery-zones/active. */
export class AddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  alias?: string;

  @ApiProperty({ example: '665f1c2e9b1e8a0012345678', description: 'Delivery zone id (city/area)' })
  @IsNotEmpty({ message: 'Please choose your area' })
  @IsMongoId({ message: 'Invalid delivery zone' })
  zone: string;

  @ApiProperty({ example: 'Group 12, Street 5' })
  @IsNotEmpty({ message: 'Address details are required' })
  @IsString()
  @MaxLength(300)
  details: string;

  @ApiPropertyOptional({ example: 'B12' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  building?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  floor?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @ApiPropertyOptional({ example: 'Next to the pharmacy' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  landmark?: string;

  @ApiPropertyOptional({ example: '01012345678', description: 'Defaults to the account phone' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=30.0444,31.2357' })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'locationUrl must be a valid link' })
  @MaxLength(500)
  locationUrl?: string;

  @ApiPropertyOptional({ example: '11835' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(AddressDto) {}
