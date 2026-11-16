import { Expose, Transform } from 'class-transformer';

export class SubCategoryResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  slug?: string;

  @Expose()
  @Transform(({ obj }) => (obj.category?._id ? obj.category._id.toString() : obj.category?.toString()))
  category: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
