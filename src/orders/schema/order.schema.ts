import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { ORDER_STATUSES, OrderStatus } from '../order-status.js';

export type OrderDocument = HydratedDocument<Order>;
export { OrderStatus };

@Schema({ _id: true })
export class OrderItem {
  _id?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  /** Snapshots so old orders stay readable if the menu changes. */
  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  titleAr?: string;

  @Prop()
  imageCover?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  /** Unit price charged (after promotions). */
  @Prop({ required: true })
  price: number;

  /** Unit menu price before promotions. */
  @Prop()
  basePrice?: number;

  @Prop()
  lineTotal?: number;

  /** Kitchen instructions, e.g. "بدون بصل". */
  @Prop({ trim: true })
  notes?: string;

  @Prop()
  color?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Promotion' })
  promotion?: Types.ObjectId;

  /** True when `quantity` was taken from stock, so cancelling must give it back. */
  @Prop()
  stockDeducted?: boolean;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'DeliveryZone' })
  zone?: Types.ObjectId;

  @Prop() alias?: string;
  @Prop() city?: string;
  @Prop() details?: string;
  @Prop() building?: string;
  @Prop() floor?: string;
  @Prop() apartment?: string;
  @Prop() landmark?: string;
  @Prop() phone?: string;
  @Prop() postalCode?: string;

  @Prop({ type: { lat: Number, lng: Number }, _id: false })
  coordinates?: { lat: number; lng: number };

  @Prop() locationUrl?: string;
}
export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
export class OrderCustomer {
  @Prop() name?: string;
  @Prop() phone?: string;
  @Prop() email?: string;
}
export const OrderCustomerSchema = SchemaFactory.createForClass(OrderCustomer);

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

@Schema({ _id: false })
export class StatusChange {
  @Prop({ type: String, enum: ORDER_STATUSES, required: true })
  status: OrderStatus;

  @Prop({ default: Date.now })
  at: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  by?: Types.ObjectId;

  @Prop({ type: String, enum: ['customer', 'restaurant', 'system'] })
  actor?: 'customer' | 'restaurant' | 'system';

  @Prop({ trim: true })
  note?: string;
}
export const StatusChangeSchema = SchemaFactory.createForClass(StatusChange);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  _id: Types.ObjectId;

  /** Human friendly sequential number (#1001) used on the phone and receipts. */
  @Prop({ unique: true, sparse: true, index: true })
  orderNumber?: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: [true, 'Order must belong to a user'], index: true })
  user: Types.ObjectId;

  /** Customer contact snapshot for the dashboard. */
  @Prop({ type: OrderCustomerSchema })
  customer?: OrderCustomer;

  @Prop({ type: [OrderItemSchema], required: true })
  cartItems: OrderItem[];

  /** Sum of line totals (after item promotions, before coupon). */
  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ trim: true })
  couponCode?: string;

  @Prop({ default: 0 })
  couponDiscount: number;

  /** Total saved through item promotions (for reporting). */
  @Prop({ default: 0 })
  itemsDiscount: number;

  @Prop({ default: 0 })
  taxPrice: number;

  /** Delivery fee of the zone. */
  @Prop({ default: 0 })
  shippingPrice: number;

  @Prop({ required: true })
  totalOrderPrice: number;

  @Prop({ type: { _id: SchemaTypes.ObjectId, name: String, nameAr: String }, _id: false })
  deliveryZone?: { _id: Types.ObjectId; name: string; nameAr?: string };

  @Prop({ type: ShippingAddressSchema })
  shippingAddress?: ShippingAddress;

  @Prop({ type: String, enum: ['card', 'cash'], default: 'cash' })
  paymentMethodType: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop()
  deliveredAt?: Date;

  @Prop({ type: String, enum: ORDER_STATUSES, default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ type: [StatusChangeSchema], default: [] })
  statusHistory: StatusChange[];

  /** Order level note for the restaurant / driver. */
  @Prop({ trim: true, maxlength: 500 })
  notes?: string;

  @Prop() acceptedAt?: Date;
  @Prop() preparingAt?: Date;
  @Prop() onTheWayAt?: Date;
  @Prop() rejectedAt?: Date;
  @Prop() cancelledAt?: Date;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ trim: true })
  cancellationReason?: string;

  @Prop({ type: String, enum: ['customer', 'restaurant'] })
  cancelledBy?: 'customer' | 'restaurant';

  @Prop({ default: 45 })
  estimatedDeliveryMinutes: number;

  /** Set when the restaurant accepts: drives the countdown in the app. */
  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop({ type: OrderReviewSchema })
  review?: OrderReview;

  createdAt?: Date;
  updatedAt?: Date;

  remainingMinutes?: number | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });

/** Minutes left until the estimated delivery time (null when not applicable). */
export function remainingMinutes(order: Pick<Order, 'status' | 'estimatedDeliveryTime'>, now = Date.now()) {
  if (order.status === OrderStatus.DELIVERED) return 0;
  if (order.status === OrderStatus.REJECTED || order.status === OrderStatus.CANCELLED) return null;
  if (!order.estimatedDeliveryTime) return null;
  const diffMs = new Date(order.estimatedDeliveryTime).getTime() - now;
  return Math.max(0, Math.ceil(diffMs / 60000));
}

OrderSchema.virtual('remainingMinutes').get(function (this: Order) {
  return remainingMinutes(this);
});
