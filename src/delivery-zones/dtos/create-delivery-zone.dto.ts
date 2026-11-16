import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Madinaty' })
  @IsNotEmpty({ message: 'Zone name is required' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'مدينتي' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiProperty({ example: 35 })
  @IsNotEmpty({ message: 'Delivery fee is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Delivery fee cannot be negative' })
  deliveryFee: number;

  @ApiPropertyOptional({ example: 35, default: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5, { message: 'Estimated delivery time must be at least 5 minutes' })
  estimatedDeliveryMinutes?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Minimum order amount cannot be negative' })
  minOrderAmount?: number;
}
