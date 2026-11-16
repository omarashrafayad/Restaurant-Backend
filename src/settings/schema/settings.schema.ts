import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ _id: false })
export class OpeningHours {
  /** 0 = Sunday ... 6 = Saturday */
  @Prop({ required: true, min: 0, max: 6 })
  day: number;

  /** "HH:mm" local time */
  @Prop({ required: true })
  open: string;

  /** "HH:mm" local time; may be earlier than `open` for after-midnight closing. */
  @Prop({ required: true })
  close: string;

  @Prop({ default: false })
  closed: boolean;
}
export const OpeningHoursSchema = SchemaFactory.createForClass(OpeningHours);

export const DEFAULT_REJECTION_REASONS = [
  'خارج نطاق التوصيل',
  'لا يوجد مناديب متاحين حالياً',
  'المطعم مغلق حالياً',
  'بعض الأصناف غير متوفرة',
  'ضغط طلبات عالي، برجاء المحاولة لاحقاً',
];

/** Singleton document holding the restaurant profile and business rules. */
@Schema({ timestamps: true, collection: 'settings' })
export class Settings {
  _id: Types.ObjectId;

  /** Fixed key so there is only ever one settings document. */
  @Prop({ default: 'restaurant', unique: true })
  key: string;

  @Prop({ default: 'Take Five', trim: true })
  name: string;

  @Prop({ default: 'تيك فايف', trim: true })
  nameAr: string;

  @Prop()
  logo?: string;

  /** Shown on every order so customers can call the restaurant directly. */
  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ trim: true })
  secondaryPhone?: string;

  @Prop({ trim: true })
  whatsapp?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ default: 'EGP' })
  currency: string;

  /** Manual kill switch ("pause orders") independent of opening hours. */
  @Prop({ default: true })
  acceptingOrders: boolean;

  @Prop({ trim: true })
  pausedMessage?: string;

  /** Empty list = open 24/7. */
  @Prop({ type: [OpeningHoursSchema], default: [] })
  openingHours: OpeningHours[];

  /** Percentage added on top of the subtotal (0 when prices include VAT). */
  @Prop({ default: 0, min: 0, max: 100 })
  taxPercentage: number;

  /** Customers may cancel their order while it is still pending. */
  @Prop({ default: true })
  allowCustomerCancelWhilePending: boolean;

  /** Default preparation + delivery time when a zone does not define one. */
  @Prop({ default: 45, min: 5 })
  defaultEstimatedDeliveryMinutes: number;

  @Prop({ type: [String], default: DEFAULT_REJECTION_REASONS })
  rejectionReasons: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
