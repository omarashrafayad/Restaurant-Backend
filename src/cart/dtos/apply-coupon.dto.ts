import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({ example: 'DISCOUNT20' })
  @IsNotEmpty({ message: 'Coupon code is required' })
  @IsString()
  coupon: string;
}
