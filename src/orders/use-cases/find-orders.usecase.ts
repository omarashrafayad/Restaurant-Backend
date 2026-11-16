import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrderRepository } from '../repository/order.repository.js';
import { SettingsService } from '../../settings/settings.service.js';
import { QueryOrdersDto } from '../dtos/query-orders.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { containsRegex, escapeRegex } from '../../common/utils/regex.util.js';
import { zonedDayRange } from '../../common/utils/time.util.js';
import { Roles } from '../../common/constants/roles.constant.js';
import { ACTIVE_STATUSES, ORDER_STATUSES, OrderStatus } from '../order-status.js';
import { remainingMinutes } from '../schema/order.schema.js';

export interface Viewer {
  userId: string;
  role: string;
}

const isStaff = (viewer: Viewer) => viewer.role === Roles.ADMIN || viewer.role === Roles.MANAGER;

@Injectable()
export class FindOrdersUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly settingsService: SettingsService,
  ) {}

  /** Adds live fields the apps need: countdown, cancel permission, server clock. */
  decorate(order: any, allowCustomerCancel: boolean, viewer: Viewer) {
    // Cancel / review actions belong to the customer who placed the order.
    const isOwner = order.user?.toString() === viewer.userId;
    return {
      ...order,
      remainingMinutes: remainingMinutes(order),
      canCancel: isOwner && allowCustomerCancel && order.status === OrderStatus.PENDING,
      canReview: isOwner && order.status === OrderStatus.DELIVERED && !order.review,
      serverTime: new Date(),
    };
  }

  async list(viewer: Viewer, query: QueryOrdersDto) {
    const filter: Record<string, any> = {};
    if (!isStaff(viewer)) filter.user = new Types.ObjectId(viewer.userId);

    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim()).filter((s) => ORDER_STATUSES.includes(s as OrderStatus));
      if (statuses.length) filter.status = { $in: statuses };
    } else if (query.scope === 'active') {
      filter.status = { $in: ACTIVE_STATUSES };
    } else if (query.scope === 'history') {
      filter.status = { $nin: ACTIVE_STATUSES };
    }

    if (query.date) {
      const { start, end } = zonedDayRange(query.date);
      filter.createdAt = { $gte: start, $lt: end };
    }

    if (query.keyword && isStaff(viewer)) {
      const keyword = query.keyword.trim().replace(/^#/, '');
      filter.$or = [
        ...(/^\d+$/.test(keyword) ? [{ orderNumber: Number(keyword) }] : []),
        { 'customer.phone': { $regex: `^${escapeRegex(keyword)}` } },
        { 'customer.name': containsRegex(keyword) },
      ];
    }

    const result = await this.orderRepository.findPaginated(filter, {
      page: query.page,
      limit: query.limit ?? 20,
      sort: query.sort,
    });

    const { allowCustomerCancelWhilePending } = await this.settingsService.get();
    result.data = result.data.map((o) => this.decorate(o, allowCustomerCancelWhilePending, viewer)) as any;
    return result as PaginatedResult<any>;
  }

  async findOne(orderId: string, viewer: Viewer) {
    const order = await this.orderRepository.model.findById(orderId).select('-__v').lean();
    // Customers get 404 (not 403) for other people's orders: no id probing.
    if (!order || (!isStaff(viewer) && order.user.toString() !== viewer.userId)) {
      throw new NotFoundException(`No order found with id: ${orderId}`);
    }

    const [settings, restaurant] = await Promise.all([
      this.settingsService.get(),
      this.settingsService.getContact(),
    ]);
    return {
      status: 'success',
      data: { ...this.decorate(order, settings.allowCustomerCancelWhilePending, viewer), restaurant },
    };
  }

  /** Orders still in progress for the customer's tracking banner. */
  async active(userId: string) {
    const [orders, settings, restaurant] = await Promise.all([
      this.orderRepository.model
        .find({ user: new Types.ObjectId(userId), status: { $in: ACTIVE_STATUSES } })
        .sort('-createdAt')
        .select('-__v')
        .lean(),
      this.settingsService.get(),
      this.settingsService.getContact(),
    ]);
    return {
      status: 'success',
      results: orders.length,
      restaurant,
      data: orders.map((o) => this.decorate(o, settings.allowCustomerCancelWhilePending, { userId, role: Roles.USER })),
    };
  }
}
