export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export const ORDER_STATUSES = Object.values(OrderStatus);

/** Orders still in progress (shown on the kitchen board / customer tracking). */
export const ACTIVE_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.ON_THE_WAY,
];

/** Orders that do not count as sales. */
export const VOID_STATUSES = [OrderStatus.REJECTED, OrderStatus.CANCELLED];

/**
 * Allowed transitions. Anything not listed here is refused, e.g. accepting a
 * delivered order or rejecting an order that is already on the way.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
  [OrderStatus.ON_THE_WAY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.REJECTED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Arabic labels used in push notifications. */
export const STATUS_LABELS_AR: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'في انتظار تأكيد المطعم',
  [OrderStatus.ACCEPTED]: 'تم قبول طلبك',
  [OrderStatus.PREPARING]: 'جاري تحضير طلبك',
  [OrderStatus.ON_THE_WAY]: 'طلبك في الطريق إليك',
  [OrderStatus.DELIVERED]: 'تم توصيل طلبك',
  [OrderStatus.REJECTED]: 'تم رفض طلبك',
  [OrderStatus.CANCELLED]: 'تم إلغاء طلبك',
};
