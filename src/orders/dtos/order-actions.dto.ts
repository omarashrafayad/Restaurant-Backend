import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptOrderDto {
  @ApiPropertyOptional({ example: 45, default: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  estimatedDeliveryMinutes?: number;
}

export class RejectOrderDto {
  @ApiProperty({ example: 'Outside our delivery coverage area' })
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString()
  reason: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'preparing',
    enum: [
      'pending',
      'accepted',
      'preparing',
      'on_the_way',
      'delivered',
      'rejected',
      'cancelled',
    ],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'Driver unavailable' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddOrderReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty({ message: 'Ratings value is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  ratings: number;

  @ApiPropertyOptional({ example: 'Food was delicious and arrived piping hot!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
