import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type SubCategoryDocument = HydratedDocument<SubCategory>;

@Schema({ timestamps: true })
export class SubCategory {
  _id: Types.ObjectId;

  @Prop({
    required: [true, 'SubCategory name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Too short SubCategory name'],
    maxlength: [32, 'Too long SubCategory name'],
  })
  name: string;

  @Prop({ lowercase: true })
  slug?: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Category',
    required: [true, 'SubCategory must belong to a parent category'],
  })
  category: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
