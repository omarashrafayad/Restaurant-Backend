import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../../common/constants/auth.constant.js';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: true })
export class Address {
  _id?: Types.ObjectId;

  @Prop({ trim: true })
  alias?: string;

  /** Delivery zone (city/area) - drives the delivery fee and minimum order. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'DeliveryZone' })
  zone?: Types.ObjectId;

  /** Zone name snapshot (kept for display and legacy addresses). */
  @Prop({ trim: true })
  city?: string;

  @Prop({ required: true, trim: true })
  details: string;

  @Prop({ trim: true })
  building?: string;

  @Prop({ trim: true })
  floor?: string;

  @Prop({ trim: true })
  apartment?: string;

  @Prop({ trim: true })
  landmark?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  postalCode?: string;

  @Prop({ type: { lat: Number, lng: Number }, _id: false })
  coordinates?: {
    lat: number;
    lng: number;
  };

  @Prop()
  locationUrl?: string;

  @Prop({ default: false })
  isDefault?: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: [true, 'name required'], trim: true })
  name: string;

  @Prop({ lowercase: true })
  slug?: string;

  @Prop({
    required: [true, 'email required'],
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  profileImg?: string;

  @Prop({ required: [true, 'password required'], minlength: [6, 'Too short password'], select: false })
  password?: string;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ select: false })
  passwordResetCode?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;

  @Prop({ select: false })
  passwordResetVerified?: boolean;

  @Prop({ select: false, default: 0 })
  passwordResetAttempts?: number;

  @Prop({
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({ default: true })
  active: boolean;

  /** Broadcast notifications created before this instant count as read. */
  @Prop()
  notificationsSeenAt?: Date;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }],
    default: [],
  })
  wishlist: Types.ObjectId[];

  @Prop({
    type: [AddressSchema],
    default: [],
  })
  addresses: Address[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});
