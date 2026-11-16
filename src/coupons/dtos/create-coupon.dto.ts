import { IsDateString, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'DISCOUNT20' })
  @IsNotEmpty({ message: 'Coupon name required' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsNotEmpty({ message: 'Coupon expire time required' })
  @IsDateString({}, { message: 'Invalid expire date format' })
  expire: string;

  @ApiProperty({ example: 20 })
  @IsNotEmpty({ message: 'Coupon discount value required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;
}
