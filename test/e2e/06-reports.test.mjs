import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { api, ctx, setupApp, signup, staff, readyCustomer } from './helpers.mjs';

let admin;
setupApp(async () => {
  admin = await staff('admin');
});

const { DailySummaryJob } = await import('../../dist/reports/daily-summary.job.js');

const pid = new mongoose.Types.ObjectId();
const pid2 = new mongoose.Types.ObjectId();
let seq = 50000;
function rawOrder({ createdAt, status = 'delivered', total = 100, fee = 20, zone = 'Madinaty', items, review, reason, acceptedAfter, deliveredAfter }) {
  const created = new Date(createdAt);
  return {
    orderNumber: seq++,
    user: new mongoose.Types.ObjectId(),
    customer: { name: 'Raw', phone: '01000000001' },
    cartItems: items ?? [{ product: pid, title: 'Classic Burger', quantity: 2, price: (total - fee) / 2, lineTotal: total - fee }],
    subtotal: total - fee,
    couponDiscount: 0,
    itemsDiscount: 0,
    taxPrice: 0,
    shippingPrice: fee,
    totalOrderPrice: total,
    deliveryZone: { _id: new mongoose.Types.ObjectId(), name: zone },
    status,
    isPaid: status === 'delivered',
    rejectionReason: reason,
    review,
    statusHistory: [],
    estimatedDeliveryMinutes: 40,
    acceptedAt: acceptedAfter ? new Date(created.getTime() + acceptedAfter * 60000) : undefined,
    deliveredAt: deliveredAfter ? new Date(created.getTime() + deliveredAfter * 60000) : undefined,
    createdAt: created,
    updatedAt: created,
  };
}

describe('M6 - daily report', () => {
  it('computes the end-of-day numbers in Cairo time', async () => {
    // 2025-01-15 (Cairo UTC+2). 22:30Z on the 14th = 00:30 on the 15th locally.
    await ctx.db.collection('orders').insertMany([
      rawOrder({ createdAt: '2025-01-14T22:30:00Z', total: 120, acceptedAfter: 4, deliveredAfter: 40, review: { ratings: 5, createdAt: new Date() } }),
      rawOrder({ createdAt: '2025-01-15T10:00:00Z', total: 220, zone: 'Shorouk', acceptedAfter: 2, deliveredAfter: 50, review: { ratings: 3, createdAt: new Date() },
        items: [{ product: pid2, title: 'Fries', quantity: 5, price: 40, lineTotal: 200 }] }),
      rawOrder({ createdAt: '2025-01-15T12:00:00Z', status: 'pending', total: 60 }),
      rawOrder({ createdAt: '2025-01-15T13:00:00Z', status: 'rejected', total: 500, reason: 'خارج نطاق التوصيل' }),
      rawOrder({ createdAt: '2025-01-15T14:00:00Z', status: 'cancelled', total: 80 }),
      // 22:00Z on the 15th = 00:00 on the 16th locally -> NOT part of the 15th
      rawOrder({ createdAt: '2025-01-15T22:00:00Z', total: 999 }),
    ]);

    const res = await api('GET', '/reports/daily?date=2025-01-15', null, admin.token);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const r = res.body.data;
    assert.equal(r.ordersCount, 5);
    assert.equal(r.salesOrders, 3);
    assert.equal(r.deliveredOrders, 2);
    assert.equal(r.pendingOrders, 1);
    assert.equal(r.rejectedOrders, 1);
    assert.equal(r.cancelledOrders, 1);
    assert.equal(r.grossSales, 400);
    assert.equal(r.deliveredSales, 340);
    assert.equal(r.collectedCash, 340);
    assert.equal(r.deliveryFees, 60);
    assert.equal(r.lostSales, 580);
    assert.equal(r.averageOrderValue, 133.33);
    assert.equal(r.avgAcceptMinutes, 3);
    assert.equal(r.avgDeliveryMinutes, 45);
    assert.deepEqual(r.rating, { average: 4, count: 2 });
    assert.equal(r.topItems[0].title, 'Fries');
    assert.equal(r.topItems[0].quantity, 5);
    assert.deepEqual(r.byZone.map((z) => z.zone).sort(), ['Madinaty', 'Shorouk']);
    assert.deepEqual(r.rejectionReasons, [{ reason: 'خارج نطاق التوصيل', count: 1 }]);
    assert.ok(r.byHour.some((h) => h.hour === 0), 'the 00:30 local order is bucketed at hour 0');
  });

  it('range report fills every day and totals match', async () => {
    const res = await api('GET', '/reports/range?from=2025-01-14&to=2025-01-16', null, admin.token);
    assert.equal(res.status, 200);
    const r = res.body.data;
    assert.deepEqual(r.days.map((d) => d.date), ['2025-01-14', '2025-01-15', '2025-01-16']);
    assert.equal(r.days[0].orders, 0);
    assert.equal(r.days[1].revenue, 400);
    assert.equal(r.days[2].revenue, 999);
    assert.equal(r.grossSales, 1399);
    assert.equal((await api('GET', '/reports/range?from=2025-01-01&to=2025-12-31', null, admin.token)).status, 400);
  });

  it('today includes live orders; customers are forbidden; legacy URLs work', async () => {
    const before = (await api('GET', '/reports/daily', null, admin.token)).body.data;
    const c = await readyCustomer(admin.token, { price: 150 });
    const order = (await api('POST', '/order', {}, c.token)).body.data;
    const after = (await api('GET', '/reports/daily', null, admin.token)).body.data;
    assert.equal(after.salesOrders, before.salesOrders + 1);
    assert.equal(after.grossSales, before.grossSales + order.totalOrderPrice);

    const customer = await signup();
    assert.equal((await api('GET', '/reports/daily', null, customer.token)).status, 403);
    assert.equal((await api('GET', '/order/analytics/daily-sales', null, admin.token)).status, 200);
    const summary = await api('GET', '/order/analytics/summary', null, admin.token);
    assert.ok(summary.body.data.lifetime.ordersCount >= 7);
  });

  it('low ratings list for follow-up and end-of-day summary job', async () => {
    const res = await api('GET', '/reports/reviews?maxRating=3', null, admin.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((o) => o.review.ratings <= 3));
    assert.ok(res.body.data.length >= 1);

    const job = ctx.app.get(DailySummaryJob);
    const report = await job.run('2025-01-15');
    assert.equal(report.grossSales, 400);
  });
});
