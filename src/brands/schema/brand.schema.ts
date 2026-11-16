import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'Brand required'],
    unique: true,
    minlength: [3, 'Too short brand name'],
    maxlength: [32, 'Too long brand name'],
    trim: true,
  })
  name: string;

  @Prop({ lowercase: true })
  slug?: string;

  @Prop()
  image?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
