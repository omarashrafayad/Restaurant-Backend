import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressInputDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({ example: 'Street 10, Building 4' })
  @IsNotEmpty()
  @IsString()
  details: string;

  @ApiProperty({ example: '+201234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Madinaty' })
  @IsNotEmpty()
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

export class SignupDto {
  @ApiProperty({ example: 'Omar Mahmoud' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(3, { message: 'Too short User name' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  passwordConfirm?: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: AddressInputDto })
  @IsOptional()
  address?: AddressInputDto;

  @ApiPropertyOptional({ type: [AddressInputDto] })
  @IsOptional()
  addresses?: AddressInputDto[];
}
