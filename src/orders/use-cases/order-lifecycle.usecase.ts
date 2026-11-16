import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import type { ClientSession, Connection } from 'mongoose';
import { OrderRepository } from '../repository/order.repository.js';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { SettingsService } from '../../settings/settings.service.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { ForbidenException } from '../../common/error-handling/custom-excepction/forbiden.exception.js';
import { canTransition, OrderStatus, VOID_STATUSES } from '../order-status.js';
import { OrderEvents, OrderStatusChangedEvent } from '../order.events.js';

export interface TransitionActor {
  userId: string;
  type: 'customer' | 'restaurant';
}

export interface TransitionOptions {
  reason?: string;
  estimatedDeliveryMinutes?: number;
}

const TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.ACCEPTED]: 'acceptedAt',
  [OrderStatus.PREPARING]: 'preparingAt',
  [OrderStatus.ON_THE_WAY]: 'onTheWayAt',
  [OrderStatus.DELIVERED]: 'deliveredAt',
  [OrderStatus.REJECTED]: 'rejectedAt',
  [OrderStatus.CANCELLED]: 'cancelledAt',
};

@Injectable()
export class OrderLifecycleUseCase {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly settingsService: SettingsService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Puts stock back for the quantities actually deducted at checkout and
   * reverses the sold counter. Uses the per-item `stockDeducted` flag so
   * toggling `trackStock` later does not lose stock (legacy items fall back
   * to the product's current setting).
   */
  async restoreStock(order: any, session: ClientSession) {
    const ops: any[] = [];
    for (const item of order.cartItems) {
      if (item.stockDeducted !== false) {
        ops.push({
          updateOne: {
            // Legacy items (no flag): only products that track stock.
            filter: item.stockDeducted ? { _id: item.product } : { _id: item.product, trackStock: true },
            update: { $inc: { quantity: item.quantity } },
          },
        });
      }
      ops.push({
        updateOne: {
          filter: { _id: item.product, sold: { $gte: item.quantity } },
          update: { $inc: { sold: -item.quantity } },
        },
      });
    }
    if (ops.length) await this.productRepository.model.bulkWrite(ops, { session });
  }

  /** Admin delete: in-progress orders give their stock back first. */
  async deleteOrder(orderId: string) {
    await this.connection.transaction(async (session) => {
      const order = await this.orderRepository.model.findOneAndDelete({ _id: orderId }, { session });
      if (!order) throw new NotFoundException(`No order found with id: ${orderId}`);
      if (!VOID_STATUSES.includes(order.status as OrderStatus) && order.status !== OrderStatus.DELIVERED) {
        await this.restoreStock(order.toObject(), session);
      }
    });
  }

  /**
   * Moves an order to a new status, enforcing the state machine and actor
   * permissions. The update is conditional on the current status so two
   * cashiers clicking at the same time cannot both succeed.
   */
  async transition(orderId: string, to: OrderStatus, actor: TransitionActor, opts: TransitionOptions = {}) {
    const order = await this.orderRepository.model.findById(orderId).lean();
    if (!order) throw new NotFoundException(`No order found with id: ${orderId}`);

    const from = order.status as OrderStatus;

    if (actor.type === 'customer') {
      if (order.user.toString() !== actor.userId) {
        throw new NotFoundException(`No order found with id: ${orderId}`);
      }
      const settings = await this.settingsService.get();
      if (to !== OrderStatus.CANCELLED || !settings.allowCustomerCancelWhilePending) {
        throw new ForbidenException('You are not allowed to perform this action');
      }
      if (from !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'The restaurant already started on your order, please call the restaurant to cancel',
        );
      }
    }

    if (!canTransition(from, to)) {
      throw new BadRequestException(`Cannot change order status from "${from}" to "${to}"`);
    }
    if (to === OrderStatus.REJECTED && !opts.reason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    const now = new Date();
    const set: Record<string, any> = { status: to };
    const field = TIMESTAMP_FIELD[to];
    if (field) set[field] = now;

    switch (to) {
      case OrderStatus.ACCEPTED: {
        const minutes = opts.estimatedDeliveryMinutes ?? order.estimatedDeliveryMinutes ?? 45;
        set.estimatedDeliveryMinutes = minutes;
        set.estimatedDeliveryTime = new Date(now.getTime() + minutes * 60_000);
        break;
      }
      case OrderStatus.DELIVERED:
        set.isDelivered = true;
        // Cash on delivery: money is collected at the door.
        if (order.paymentMethodType === 'cash' && !order.isPaid) {
          set.isPaid = true;
          set.paidAt = now;
        }
        break;
      case OrderStatus.REJECTED:
        set.rejectionReason = opts.reason!.trim();
        break;
      case OrderStatus.CANCELLED:
        set.cancelledBy = actor.type;
        if (opts.reason?.trim()) set.cancellationReason = opts.reason.trim();
        break;
    }

    const historyEntry = {
      status: to,
      at: now,
      by: new Types.ObjectId(actor.userId),
      actor: actor.type,
      ...(opts.reason?.trim() && { note: opts.reason.trim() }),
    };

    const updated = await this.connection.transaction(async (session) => {
      const doc = await this.orderRepository.model.findOneAndUpdate(
        { _id: order._id, status: from },
        { $set: set, $push: { statusHistory: historyEntry } },
        { returnDocument: 'after', session },
      );
      if (!doc) {
        throw new BadRequestException('This order was just updated by someone else, please refresh');
      }
      if (VOID_STATUSES.includes(to)) await this.restoreStock(order, session);
      return doc;
    });

    const plain = updated.toObject();
    this.events.emit(OrderEvents.STATUS_CHANGED, {
      order: plain,
      previousStatus: from,
      status: to,
      actor: actor.type,
      reason: opts.reason,
    } satisfies OrderStatusChangedEvent);
    return plain;
  }

  async markPaid(orderId: string) {
    const updated = await this.orderRepository.model.findOneAndUpdate(
      { _id: orderId, status: { $nin: VOID_STATUSES } },
      { $set: { isPaid: true, paidAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!updated) throw new NotFoundException(`No payable order found with id: ${orderId}`);
    return updated.toObject();
  }
}
