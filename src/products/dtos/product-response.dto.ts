import { Expose, Transform } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  title: string;

  @Expose()
  slug?: string;

  @Expose()
  description: string;

  @Expose()
  quantity: number;

  @Expose()
  sold: number;

  @Expose()
  price: number;

  @Expose()
  priceAfterDiscount?: number;

  @Expose()
  colors: string[];

  @Expose()
  imageCover: string;

  @Expose()
  images: string[];

  @Expose()
  category: any;

  @Expose()
  subcategories: any[];

  @Expose()
  brand?: any;

  @Expose()
  ratingsAverage: number;

  @Expose()
  ratingsQuantity: number;

  @Expose()
  new: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
