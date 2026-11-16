import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    minlength: [3, 'Too short product title'],
    maxlength: [100, 'Too long product title'],
  })
  title: string;

  @Prop({ lowercase: true })
  slug?: string;

  @Prop({ trim: true, maxlength: [100, 'Too long product title'] })
  titleAr?: string;

  @Prop({ trim: true, maxlength: [2000, 'Too long product description'] })
  description?: string;

  @Prop({ trim: true, maxlength: [2000, 'Too long product description'] })
  descriptionAr?: string;

  /** Restaurant switch: hide/disable an item without deleting it ("sold out today"). */
  @Prop({ default: true, index: true })
  isAvailable: boolean;

  /** When true, `quantity` is enforced and decremented on every order. */
  @Prop({ default: false })
  trackStock: boolean;

  @Prop({ default: 0, min: [0, 'Quantity cannot be negative'] })
  quantity: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ required: [true, 'Product price is required'], max: [200000, 'Too long product price'] })
  price: number;

  @Prop()
  priceAfterDiscount?: number;

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop()
  imageCover?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to category'],
    index: true,
  })
  category: Types.ObjectId;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'SubCategory' }],
    default: [],
  })
  subcategories: Types.ObjectId[];

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Brand',
  })
  brand?: Types.ObjectId;

  @Prop({ default: 1, min: [1, 'Rating must be >= 1.0'], max: [5, 'Rating must be <= 5.0'] })
  ratingsAverage: number;

  @Prop({ default: 0 })
  ratingsQuantity: number;

  @Prop({ default: false })
  new: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ title: 'text', titleAr: 'text', description: 'text' });

ProductSchema.pre(/^find/, function () {
  (this as any).populate({
    path: 'category',
    select: 'name image _id',
  });
});
