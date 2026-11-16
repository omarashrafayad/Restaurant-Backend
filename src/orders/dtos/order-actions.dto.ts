import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../order-status.js';

export class AcceptOrderDto {
  @ApiPropertyOptional({ example: 45, description: 'Minutes until delivery; defaults to the zone estimate' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(300)
  estimatedDeliveryMinutes?: number;
}

export class RejectOrderDto {
  @ApiProperty({ example: 'خارج نطاق التوصيل', description: 'Pick one of settings.rejectionReasons or type a custom one' })
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString()
  @MaxLength(300)
  reason: string;
}

const STAFF_STATUSES = [
  OrderStatus.PREPARING,
  OrderStatus.ON_THE_WAY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: STAFF_STATUSES, example: OrderStatus.PREPARING })
  @IsIn(STAFF_STATUSES as unknown as string[])
  status: (typeof STAFF_STATUSES)[number];

  @ApiPropertyOptional({ example: 'Customer did not answer the phone' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Ordered by mistake' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class AddOrderReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  ratings: number;

  @ApiPropertyOptional({ example: 'الأكل كان سخن وطعمه جميل' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
