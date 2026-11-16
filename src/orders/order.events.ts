import { OrderStatus } from './order-status.js';

export const OrderEvents = {
  CREATED: 'order.created',
  STATUS_CHANGED: 'order.status_changed',
  REVIEWED: 'order.reviewed',
} as const;

export interface OrderCreatedEvent {
  order: any;
}

export interface OrderStatusChangedEvent {
  order: any;
  previousStatus: OrderStatus;
  status: OrderStatus;
  actor: 'customer' | 'restaurant' | 'system';
  reason?: string;
}

export interface OrderReviewedEvent {
  order: any;
}
