import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PROMOTION = 'promotion',
  ANNOUNCEMENT = 'announcement',
}

/**
 * In-app inbox entry. Personal notifications have `user`; broadcasts
 * (promotions / announcements) have audience "all" and no user.
 */
@Schema({ timestamps: true })
export class Notification {
  _id: Types.ObjectId;

  @Prop({ type: String, enum: ['user', 'all'], default: 'user', index: true })
  audience: 'user' | 'all';

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', index: true })
  user?: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(NotificationType), required: true })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  body: string;

  /** Deep-link payload, e.g. { orderId } or { promotionId }. */
  @Prop({ type: Object, default: {} })
  data: Record<string, string>;

  @Prop()
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Keep the inbox small: entries expire after 90 days.
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });
