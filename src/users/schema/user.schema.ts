import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: true })
export class Address {
  _id?: Types.ObjectId;

  @Prop()
  alias?: string;

  @Prop({ required: true })
  details: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  postalCode?: string;

  @Prop({ type: { lat: Number, lng: Number } })
  coordinates?: {
    lat: number;
    lng: number;
  };

  @Prop()
  locationUrl?: string;
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

  @Prop({ required: [true, 'password required'], minlength: [6, 'Too short password'] })
  password?: string;

  @Prop()
  passwordChangedAt?: Date;

  @Prop()
  passwordResetCode?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  passwordResetVerified?: boolean;

  @Prop({
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({ default: true })
  active: boolean;

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
  this.password = await bcrypt.hash(this.password, 12);
});

const setImageURL = (doc: any) => {
  if (doc && doc.profileImg && !doc.profileImg.startsWith('http')) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    doc.profileImg = `${baseUrl}/user/${doc.profileImg}`;
  }
};

UserSchema.post('init', (doc) => {
  setImageURL(doc);
});

UserSchema.post('save', (doc) => {
  setImageURL(doc);
});
