import { Types } from 'mongoose';

/** Minimal product shape the pricing engine needs. */
export interface PricableProduct {
  _id: Types.ObjectId | string;
  price: number;
  priceAfterDiscount?: number | null;
  category?: Types.ObjectId | string | { _id: Types.ObjectId | string } | null;
}

export interface AppliedPromotion {
  _id: string;
  title: string;
  discountPercentage: number;
  endDate?: Date;
}

export interface ProductPrice {
  /** Menu price before any discount. */
  basePrice: number;
  /** What the customer pays for one unit right now. */
  finalPrice: number;
  /** basePrice - finalPrice */
  discount: number;
  /** Promotion that produced finalPrice, if any. */
  promotion?: AppliedPromotion;
}
