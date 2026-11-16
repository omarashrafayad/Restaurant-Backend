import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: true })
export class CartItem {
  _id?: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: Types.ObjectId;

  @Prop({ default: 1 })
  quantity: number;

  @Prop()
  color?: string;

  @Prop({ required: true })
  price: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  _id: Types.ObjectId;

  @Prop({
    type: [CartItemSchema],
    default: [],
  })
  cartItems: CartItem[];

  @Prop({ default: 0 })
  totalCartPrice: number;

  @Prop()
  totalPriceAfterDiscount?: number;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
