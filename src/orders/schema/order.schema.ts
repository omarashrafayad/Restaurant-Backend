import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

@Schema({ _id: true })
export class OrderItem {
  _id?: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  color?: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  itemNotes?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop()
  details?: string;

  @Prop()
  phone?: string;

  @Prop()
  city?: string;

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

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
export class OrderReview {
  @Prop({ min: 1, max: 5, required: true })
  ratings: number;

  @Prop({ trim: true })
  comment?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const OrderReviewSchema = SchemaFactory.createForClass(OrderReview);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  _id: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  })
  user: Types.ObjectId;

  @Prop({
    type: [OrderItemSchema],
    required: true,
  })
  cartItems: OrderItem[];

  @Prop({ default: 0 })
  taxPrice: number;

  @Prop({ type: ShippingAddressSchema })
  shippingAddress?: ShippingAddress;

  @Prop({ default: 0 })
  shippingPrice: number;

  @Prop({ required: true })
  totalOrderPrice: number;

  @Prop({
    type: String,
    enum: ['card', 'cash'],
    default: 'cash',
  })
  paymentMethodType: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop()
  deliveredAt?: Date;

  @Prop({
    type: String,
    enum: [
      'pending',
      'accepted',
      'preparing',
      'on_the_way',
      'delivered',
      'rejected',
      'cancelled',
    ],
    default: 'pending',
  })
  status: OrderStatus;

  @Prop({ trim: true })
  notes?: string;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ default: 40 })
  estimatedDeliveryMinutes: number;

  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop({ type: OrderReviewSchema })
  review?: OrderReview;

  createdAt?: Date;
  updatedAt?: Date;

  remainingMinutes?: number | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('remainingMinutes').get(function (this: any) {
  if (this.status === 'delivered') return 0;
  if (this.status === 'rejected' || this.status === 'cancelled') return null;
  if (!this.estimatedDeliveryTime) return undefined;
  const diffMs = new Date(this.estimatedDeliveryTime).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 60000));
});

OrderSchema.pre(/^find/, function () {
  (this as any)
    .populate({
      path: 'user',
      select: 'name email phone addresses',
    })
    .populate({
      path: 'cartItems.product',
      select: 'title imageCover price priceAfterDiscount',
    });
});
