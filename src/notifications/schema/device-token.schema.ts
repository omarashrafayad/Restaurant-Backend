import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

/** FCM registration token of a logged-in device. */
@Schema({ timestamps: true })
export class DeviceToken {
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: String, enum: ['android', 'ios', 'web'], default: 'android' })
  platform: string;

  /** customer app or restaurant dashboard/cashier app */
  @Prop({ type: String, enum: ['customer', 'dashboard'], default: 'customer', index: true })
  app: string;

  @Prop({ type: String, enum: ['ar', 'en'], default: 'ar' })
  lang: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
