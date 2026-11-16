import { Expose, Transform } from 'class-transformer';

export class DeliveryZoneResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  nameAr?: string;

  @Expose()
  deliveryFee: number;

  @Expose()
  estimatedDeliveryMinutes: number;

  @Expose()
  isActive: boolean;

  @Expose()
  minOrderAmount: number;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
