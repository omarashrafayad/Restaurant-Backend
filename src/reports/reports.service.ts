import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { OrderRepository } from '../orders/repository/order.repository.js';
import { ACTIVE_STATUSES, OrderStatus, VOID_STATUSES } from '../orders/order-status.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { restaurantTz, todayStr, zonedDayRange } from '../common/utils/time.util.js';
import { roundMoney } from '../common/utils/money.util.js';

const MAX_RANGE_DAYS = 92;
const r2 = (v: number | null | undefined) => roundMoney(v ?? 0);

/** Sales = every order that was not rejected or cancelled. */
const SALE = { $not: { $in: ['$status', VOID_STATUSES] } };
const sumIf = (cond: any, field: string) => ({ $sum: { $cond: [cond, field, 0] } });
const countIf = (cond: any) => ({ $sum: { $cond: [cond, 1, 0] } });
const minutesBetween = (from: string, to: string) => ({ $divide: [{ $subtract: [to, from] }, 60000] });

@Injectable()
export class ReportsService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /** Headline numbers for a set of orders (shared by daily, range and summary). */
  private totalsGroup() {
    return {
      _id: null,
      ordersCount: { $sum: 1 },
      salesOrders: countIf(SALE),
      deliveredOrders: countIf({ $eq: ['$status', OrderStatus.DELIVERED] }),
      activeOrders: countIf({ $in: ['$status', ACTIVE_STATUSES] }),
      pendingOrders: countIf({ $eq: ['$status', OrderStatus.PENDING] }),
      rejectedOrders: countIf({ $eq: ['$status', OrderStatus.REJECTED] }),
      cancelledOrders: countIf({ $eq: ['$status', OrderStatus.CANCELLED] }),
      grossSales: sumIf(SALE, '$totalOrderPrice'),
      deliveredSales: sumIf({ $eq: ['$status', OrderStatus.DELIVERED] }, '$totalOrderPrice'),
      collectedCash: sumIf({ $and: [SALE, '$isPaid'] }, '$totalOrderPrice'),
      itemsSales: sumIf(SALE, '$subtotal'),
      deliveryFees: sumIf(SALE, '$shippingPrice'),
      couponDiscounts: sumIf(SALE, '$couponDiscount'),
      promotionDiscounts: sumIf(SALE, '$itemsDiscount'),
      taxes: sumIf(SALE, '$taxPrice'),
      lostSales: sumIf({ $in: ['$status', VOID_STATUSES] }, '$totalOrderPrice'),
      avgAcceptMinutes: { $avg: { $cond: ['$acceptedAt', minutesBetween('$createdAt', '$acceptedAt'), null] } },
      avgDeliveryMinutes: { $avg: { $cond: ['$deliveredAt', minutesBetween('$createdAt', '$deliveredAt'), null] } },
      ratingAvg: { $avg: '$review.ratings' },
      ratingCount: { $sum: { $cond: [{ $gt: ['$review.ratings', 0] }, 1, 0] } },
    };
  }

  private formatTotals(t: any = {}) {
    const salesOrders = t.salesOrders ?? 0;
    return {
      ordersCount: t.ordersCount ?? 0,
      salesOrders,
      deliveredOrders: t.deliveredOrders ?? 0,
      activeOrders: t.activeOrders ?? 0,
      pendingOrders: t.pendingOrders ?? 0,
      rejectedOrders: t.rejectedOrders ?? 0,
      cancelledOrders: t.cancelledOrders ?? 0,
      grossSales: r2(t.grossSales),
      deliveredSales: r2(t.deliveredSales),
      collectedCash: r2(t.collectedCash),
      itemsSales: r2(t.itemsSales),
      deliveryFees: r2(t.deliveryFees),
      couponDiscounts: r2(t.couponDiscounts),
      promotionDiscounts: r2(t.promotionDiscounts),
      taxes: r2(t.taxes),
      lostSales: r2(t.lostSales),
      averageOrderValue: salesOrders ? r2(t.grossSales / salesOrders) : 0,
      avgAcceptMinutes: t.avgAcceptMinutes != null ? Math.round(t.avgAcceptMinutes) : null,
      avgDeliveryMinutes: t.avgDeliveryMinutes != null ? Math.round(t.avgDeliveryMinutes) : null,
      rating: { average: t.ratingAvg ? Math.round(t.ratingAvg * 10) / 10 : null, count: t.ratingCount ?? 0 },
    };
  }

  private topItemsPipeline(limit = 10): PipelineStage.FacetPipelineStage[] {
    return [
      { $match: { status: { $nin: VOID_STATUSES } } },
      { $unwind: '$cartItems' },
      {
        $group: {
          _id: '$cartItems.product',
          title: { $last: '$cartItems.title' },
          titleAr: { $last: '$cartItems.titleAr' },
          quantity: { $sum: '$cartItems.quantity' },
          revenue: { $sum: { $ifNull: ['$cartItems.lineTotal', { $multiply: ['$cartItems.price', '$cartItems.quantity'] }] } },
        },
      },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: limit },
    ];
  }

  /** End-of-day report the owner asked for: sales + number of orders, and details. */
  async daily(date: string = todayStr()) {
    const tz = restaurantTz();
    const { start, end } = zonedDayRange(date, tz);

    const [facets] = await this.orderRepository.model.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $facet: {
          totals: [{ $group: this.totalsGroup() }],
          topItems: this.topItemsPipeline(10),
          byZone: [
            { $match: { status: { $nin: VOID_STATUSES } } },
            {
              $group: {
                _id: { $ifNull: ['$deliveryZone.name', '$shippingAddress.city'] },
                orders: { $sum: 1 },
                revenue: { $sum: '$totalOrderPrice' },
                deliveryFees: { $sum: '$shippingPrice' },
              },
            },
            { $sort: { revenue: -1 } },
          ],
          byHour: [
            { $match: { status: { $nin: VOID_STATUSES } } },
            {
              $group: {
                _id: { $hour: { date: '$createdAt', timezone: tz } },
                orders: { $sum: 1 },
                revenue: { $sum: '$totalOrderPrice' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          rejectionReasons: [
            { $match: { status: OrderStatus.REJECTED } },
            { $group: { _id: '$rejectionReason', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    return {
      date,
      timezone: tz,
      ...this.formatTotals(facets.totals[0]),
      topItems: facets.topItems.map((i: any) => ({
        productId: i._id,
        title: i.title,
        titleAr: i.titleAr,
        quantity: i.quantity,
        revenue: r2(i.revenue),
      })),
      byZone: facets.byZone.map((z: any) => ({
        zone: z._id ?? 'Unknown',
        orders: z.orders,
        revenue: r2(z.revenue),
        deliveryFees: r2(z.deliveryFees),
      })),
      byHour: facets.byHour.map((h: any) => ({ hour: h._id, orders: h.orders, revenue: r2(h.revenue) })),
      rejectionReasons: facets.rejectionReasons.map((r: any) => ({ reason: r._id ?? '-', count: r.count })),
    };
  }

  /** Totals + one row per day between two local dates (inclusive). */
  async range(from?: string, to?: string) {
    const tz = restaurantTz();
    const toDate = to ?? todayStr(tz);
    const fromDate =
      from ?? new Date(Date.parse(`${toDate}T00:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10);

    const days = Math.round((Date.parse(`${toDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / 86400000) + 1;
    if (days < 1) throw new BadRequestException('"from" must be before "to"');
    if (days > MAX_RANGE_DAYS) throw new BadRequestException(`Maximum range is ${MAX_RANGE_DAYS} days`);

    const start = zonedDayRange(fromDate, tz).start;
    const end = zonedDayRange(toDate, tz).end;

    const [facets] = await this.orderRepository.model.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $facet: {
          totals: [{ $group: this.totalsGroup() }],
          topItems: this.topItemsPipeline(10),
          perDay: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tz } },
                orders: countIf(SALE),
                revenue: sumIf(SALE, '$totalOrderPrice'),
                rejected: countIf({ $eq: ['$status', OrderStatus.REJECTED] }),
                cancelled: countIf({ $eq: ['$status', OrderStatus.CANCELLED] }),
              },
            },
          ],
        },
      },
    ]);

    // Fill days without orders so charts have a continuous axis.
    const byDay = new Map(facets.perDay.map((d: any) => [d._id, d]));
    const series = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.parse(`${fromDate}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
      const d: any = byDay.get(date) ?? {};
      return { date, orders: d.orders ?? 0, revenue: r2(d.revenue), rejected: d.rejected ?? 0, cancelled: d.cancelled ?? 0 };
    });

    return {
      from: fromDate,
      to: toDate,
      timezone: tz,
      ...this.formatTotals(facets.totals[0]),
      topItems: facets.topItems.map((i: any) => ({
        productId: i._id,
        title: i.title,
        titleAr: i.titleAr,
        quantity: i.quantity,
        revenue: r2(i.revenue),
      })),
      days: series,
    };
  }

  /** Lifetime numbers + today (dashboard header cards). */
  async summary() {
    const [today, [lifetime]] = await Promise.all([
      this.daily(),
      this.orderRepository.model.aggregate([{ $group: this.totalsGroup() }]),
    ]);
    return { today, lifetime: this.formatTotals(lifetime) };
  }

  /** Latest customer ratings for the restaurant to follow up on. */
  async reviews(page = 1, limit = 20, maxRating?: number) {
    const filter: Record<string, any> = { 'review.ratings': { $exists: true } };
    if (maxRating) filter['review.ratings'] = { $lte: maxRating };
    const [items, total] = await Promise.all([
      this.orderRepository.model
        .find(filter)
        .select('orderNumber customer review totalOrderPrice deliveredAt createdAt')
        .sort({ 'review.createdAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderRepository.model.countDocuments(filter),
    ]);
    return { data: items, meta: { totalCount: total, page, limit, pageCount: Math.ceil(total / limit) } };
  }
}
