import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from './schema/notification.schema.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { SocketEvents } from '../realtime/realtime.events.js';
import { OrderRepository } from '../orders/repository/order.repository.js';
import { OrderEvents } from '../orders/order.events.js';
import type {
  OrderCreatedEvent,
  OrderReviewedEvent,
  OrderStatusChangedEvent,
} from '../orders/order.events.js';
import { OrderStatus } from '../orders/order-status.js';
import { remainingMinutes } from '../orders/schema/order.schema.js';

/** Compact payload for list/board updates. */
function orderSummary(order: any) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    totalOrderPrice: order.totalOrderPrice,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    remainingMinutes: remainingMinutes(order),
    rejectionReason: order.rejectionReason,
    cancellationReason: order.cancellationReason,
    cancelledBy: order.cancelledBy,
    updatedAt: order.updatedAt,
  };
}

function customerMessage(e: OrderStatusChangedEvent): { title: string; body: string } | null {
  const n = `#${e.order.orderNumber}`;
  switch (e.status) {
    case OrderStatus.ACCEPTED:
      return { title: `تم قبول طلبك ${n} 🎉`, body: `الوقت المتوقع للتوصيل ${e.order.estimatedDeliveryMinutes} دقيقة` };
    case OrderStatus.PREPARING:
      return { title: `جاري تحضير طلبك ${n} 👨‍🍳`, body: 'المطبخ بدأ يجهز طلبك' };
    case OrderStatus.ON_THE_WAY:
      return { title: `طلبك ${n} في الطريق 🛵`, body: 'المندوب في الطريق إليك' };
    case OrderStatus.DELIVERED:
      return { title: `تم توصيل طلبك ${n}`, body: 'بالهنا والشفا! قيّم تجربتك معانا ⭐' };
    case OrderStatus.REJECTED:
      return { title: `نعتذر، لم نتمكن من قبول طلبك ${n}`, body: e.order.rejectionReason || 'تواصل معنا للمزيد من التفاصيل' };
    case OrderStatus.CANCELLED:
      // The customer already knows they cancelled.
      return e.actor === 'customer'
        ? null
        : { title: `تم إلغاء طلبك ${n}`, body: e.order.cancellationReason || 'تواصل مع المطعم للمزيد من التفاصيل' };
    default:
      return null;
  }
}

@Injectable()
export class OrderNotificationsListener {
  private readonly logger = new Logger(OrderNotificationsListener.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
    private readonly orderRepository: OrderRepository,
  ) {}

  private async emitPendingCount() {
    const count = await this.orderRepository.model.countDocuments({ status: OrderStatus.PENDING });
    this.realtime.toStaff(SocketEvents.PENDING_COUNT, { count });
  }

  @OnEvent(OrderEvents.CREATED, { async: true })
  async onCreated({ order }: OrderCreatedEvent) {
    try {
      // Dashboard: full order (customer, address, items with notes) + alarm flag.
      this.realtime.toStaff(SocketEvents.ORDER_NEW, { order, playSound: true });
      await this.emitPendingCount();

      const area = order.shippingAddress?.city ?? '';
      await this.notifications.alertStaff({
        title: `🔔 طلب جديد #${order.orderNumber}`,
        body: `${order.customer?.name ?? ''} • ${order.totalOrderPrice} ج.م • ${area}`,
        data: { type: 'new_order', orderId: order._id.toString() },
        sound: 'order_alarm',
      });
    } catch (err: any) {
      this.logger.error(`order.created notification failed: ${err.message}`);
    }
  }

  @OnEvent(OrderEvents.STATUS_CHANGED, { async: true })
  async onStatusChanged(event: OrderStatusChangedEvent) {
    try {
      const summary = orderSummary(event.order);
      const userId = event.order.user.toString();
      this.realtime.toUser(userId, SocketEvents.ORDER_UPDATED, summary);
      this.realtime.toStaff(SocketEvents.ORDER_UPDATED, { ...summary, previousStatus: event.previousStatus, actor: event.actor });
      await this.emitPendingCount();

      if (event.actor === 'customer' && event.status === OrderStatus.CANCELLED) {
        await this.notifications.alertStaff({
          title: `❌ العميل ألغى الطلب #${event.order.orderNumber}`,
          body: event.order.cancellationReason || 'تم الإلغاء قبل القبول',
          data: { type: 'order_cancelled', orderId: summary._id },
        });
      }

      const msg = customerMessage(event);
      if (msg) {
        await this.notifications.notifyUser(userId, {
          type: NotificationType.ORDER_STATUS,
          ...msg,
          data: { orderId: summary._id, status: event.status },
        });
      }
    } catch (err: any) {
      this.logger.error(`order.status_changed notification failed: ${err.message}`);
    }
  }

  @OnEvent(OrderEvents.REVIEWED, { async: true })
  async onReviewed({ order }: OrderReviewedEvent) {
    this.realtime.toStaff(SocketEvents.ORDER_REVIEWED, {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      review: order.review,
      customer: order.customer,
    });
  }
}
