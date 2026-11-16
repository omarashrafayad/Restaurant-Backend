import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;
export type PromotionTarget = 'all' | 'category' | 'products';

/**
 * Scheduled discount. Active when:
 *   isActive && startDate <= now <= endDate
 *   && (daysOfWeek empty || today in daysOfWeek)
 *   && (no time window || now inside [startTime, endTime))
 * All day/time rules use the restaurant timezone.
 */
@Schema({ timestamps: true })
export class Promotion {
  _id: Types.ObjectId;

  @Prop({ required: [true, 'Promotion title is required'], trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  /** Optional home-screen banner (relative upload path). */
  @Prop()
  banner?: string;

  @Prop({
    required: [true, 'Discount percentage is required'],
    min: [1, 'Discount must be at least 1%'],
    max: [90, 'Discount cannot exceed 90%'],
  })
  discountPercentage: number;

  @Prop({ type: String, enum: ['all', 'category', 'products'], default: 'all' })
  target: PromotionTarget;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }], default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }], default: [] })
  products: Types.ObjectId[];

  /** 0 = Sunday ... 6 = Saturday. Empty = every day. */
  @Prop({ type: [Number], default: [] })
  daysOfWeek: number[];

  /** Optional daily window "HH:mm" (local); endTime < startTime = past midnight. */
  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop({ default: Date.now, index: true })
  startDate: Date;

  @Prop({ index: true })
  endDate?: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;

  /** Push "the offer started" to all customers at the start of each window. */
  @Prop({ default: true })
  notifyCustomers: boolean;

  /** Key of the last window customers were notified about (dedup across instances). */
  @Prop()
  lastNotifiedKey?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
