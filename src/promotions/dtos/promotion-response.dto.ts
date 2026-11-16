import { Expose, Transform } from 'class-transformer';

export class PromotionResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  discountPercentage: number;

  @Expose()
  target: string;

  @Expose()
  categories?: any[];

  @Expose()
  products?: any[];

  @Expose()
  daysOfWeek?: number[];

  @Expose()
  startDate?: Date;

  @Expose()
  endDate?: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
