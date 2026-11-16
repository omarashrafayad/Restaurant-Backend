import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;

@Schema({ timestamps: true })
export class Promotion {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'Promotion title is required'],
    trim: true,
  })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    required: [true, 'Discount percentage is required'],
    min: [1, 'Discount must be at least 1%'],
    max: [100, 'Discount cannot exceed 100%'],
  })
  discountPercentage: number;

  @Prop({
    type: String,
    enum: ['all', 'category', 'products'],
    default: 'all',
    required: [true, 'Promotion target (all, category, products) is required'],
  })
  target: 'all' | 'category' | 'products';

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }],
    default: [],
  })
  categories?: Types.ObjectId[];

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }],
    default: [],
  })
  products?: Types.ObjectId[];

  @Prop({
    type: [Number],
    default: [],
  })
  daysOfWeek?: number[];

  @Prop({ default: Date.now })
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
