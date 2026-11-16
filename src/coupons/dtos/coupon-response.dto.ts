import { Expose, Transform } from 'class-transformer';

export class CouponResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  expire: Date;

  @Expose()
  discount: number;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
