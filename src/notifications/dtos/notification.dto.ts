import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ description: 'FCM registration token' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(4096)
  token: string;

  @ApiPropertyOptional({ enum: ['android', 'ios', 'web'], default: 'android' })
  @IsOptional()
  @IsIn(['android', 'ios', 'web'])
  platform?: string;

  @ApiPropertyOptional({ enum: ['customer', 'dashboard'], default: 'customer', description: 'dashboard = restaurant cashier/staff app' })
  @IsOptional()
  @IsIn(['customer', 'dashboard'])
  app?: string;

  @ApiPropertyOptional({ enum: ['ar', 'en'], default: 'ar' })
  @IsOptional()
  @IsIn(['ar', 'en'])
  lang?: string;
}

export class BroadcastDto {
  @ApiProperty({ example: 'خصم 20% النهارده بس!' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'على كل البرجر لحد الساعة 12 بالليل' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  body: string;
}

export class InboxQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
