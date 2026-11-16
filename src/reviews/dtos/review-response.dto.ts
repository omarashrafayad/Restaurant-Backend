import { Expose, Transform } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  title?: string;

  @Expose()
  ratings: number;

  @Expose()
  user: any;

  @Expose()
  product: any;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
