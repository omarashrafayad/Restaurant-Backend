import { Expose, Transform } from 'class-transformer';

export class BrandResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  slug?: string;

  @Expose()
  image?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
