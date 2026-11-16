import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'Category required'],
    unique: true,
    minlength: [3, 'Too short category name'],
    maxlength: [32, 'Too long category name'],
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

export const CategorySchema = SchemaFactory.createForClass(Category);
