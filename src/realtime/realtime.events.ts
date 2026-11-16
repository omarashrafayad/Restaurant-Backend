/** Socket.IO event names (documented for the app developers in docs/REALTIME.md). */
export const SocketEvents = {
  /** staff: a new order arrived -> show it and play the alarm. */
  ORDER_NEW: 'order:new',
  /** staff + owner: order status / ETA changed. */
  ORDER_UPDATED: 'order:updated',
  /** staff: a customer rated an order. */
  ORDER_REVIEWED: 'order:reviewed',
  /** staff: number of orders waiting for accept/reject (dashboard badge). */
  PENDING_COUNT: 'orders:pending_count',
  /** everyone: restaurant opened/paused. */
  RESTAURANT_STATUS: 'restaurant:status',
  /** owner: new inbox notification. */
  NOTIFICATION: 'notification:new',
} as const;

export const Rooms = {
  STAFF: 'staff',
  user: (userId: string) => `user:${userId}`,
};
