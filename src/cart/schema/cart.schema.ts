import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

export const MAX_ITEM_QUANTITY = 50;

@Schema({ _id: true })
export class CartItem {
  _id?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ default: 1, min: 1, max: MAX_ITEM_QUANTITY })
  quantity: number;

  /** Kitchen instructions for this line, e.g. "بدون بصل". */
  @Prop({ trim: true, maxlength: 200, default: '' })
  notes?: string;

  /** Kept for backwards compatibility with the e-commerce apps. */
  @Prop()
  color?: string;

  /** Unit price at the last recalculation (always refreshed on read). */
  @Prop({ required: true })
  price: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  _id: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  cartItems: CartItem[];

  @Prop({ default: 0 })
  totalCartPrice: number;

  @Prop()
  totalPriceAfterDiscount?: number;

  @Prop({ trim: true, uppercase: true })
  couponCode?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
