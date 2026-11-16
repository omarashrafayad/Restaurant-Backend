import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeliveryZoneDocument = HydratedDocument<DeliveryZone>;

@Schema({ timestamps: true })
export class DeliveryZone {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'Zone name is required'],
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({ trim: true })
  nameAr?: string;

  @Prop({
    required: [true, 'Delivery fee is required'],
    min: [0, 'Delivery fee cannot be negative'],
  })
  deliveryFee: number;

  @Prop({
    default: 40,
    min: [5, 'Estimated delivery time must be at least 5 minutes'],
  })
  estimatedDeliveryMinutes: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    default: 0,
    min: [0, 'Minimum order amount cannot be negative'],
  })
  minOrderAmount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);
