import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'Coupon name required'],
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({ required: [true, 'Coupon expire time required'] })
  expire: Date;

  @Prop({ required: [true, 'Coupon discount value required'] })
  discount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
