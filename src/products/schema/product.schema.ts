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

  @Prop({
    required: [true, 'Product description is required'],
    minlength: [20, 'Too short product description'],
    maxlength: [2000, 'Too long product description'],
  })
  description: string;

  @Prop({ required: [true, 'Product quantity is required'] })
  quantity: number;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ required: [true, 'Product price is required'], max: [200000, 'Too long product price'] })
  price: number;

  @Prop()
  priceAfterDiscount?: number;

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ required: [true, 'Product Image cover is required'] })
  imageCover: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to category'],
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

ProductSchema.pre(/^find/, function () {
  (this as any).populate({
    path: 'category',
    select: 'name image _id',
  });
});

const setImageURL = (doc: any) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  if (doc && doc.imageCover && !doc.imageCover.startsWith('http')) {
    doc.imageCover = `${baseUrl}/products/${doc.imageCover}`;
  }
  if (doc && doc.images && Array.isArray(doc.images)) {
    doc.images = doc.images.map((img: string) => {
      if (typeof img === 'string' && !img.startsWith('http')) {
        return `${baseUrl}/products/${img}`;
      }
      return img;
    });
  }
};

ProductSchema.post('init', (doc) => {
  setImageURL(doc);
});

ProductSchema.post('save', (doc) => {
  setImageURL(doc);
});
