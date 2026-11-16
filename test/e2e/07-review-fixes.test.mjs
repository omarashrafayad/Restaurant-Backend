import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { api, ctx, setupApp, staff, readyCustomer, createCategory, createProduct, uniq } from './helpers.mjs';

let admin;
setupApp(async () => {
  admin = await staff('admin');
});

describe('Review fixes', () => {
  it('double-tapping "place order" creates exactly one order', async () => {
    const c = await readyCustomer(admin.token);
    const results = await Promise.all([1, 2, 3].map(() => api('POST', '/order', {}, c.token)));
    assert.equal(results.filter((r) => r.status === 201).length, 1, JSON.stringify(results.map((r) => r.status)));
    const orders = await api('GET', '/order', null, c.token);
    assert.equal(orders.body.data.length, 1);
  });

  it('an expired coupon blocks checkout with a message instead of silently charging more', async () => {
    const c = await readyCustomer(admin.token, { price: 100 });
    const code = uniq('EXP').toUpperCase();
    await api('POST', '/coupon', { name: code, expire: new Date(Date.now() + 86400000).toISOString(), discount: 10 }, admin.token);
    await api('PATCH', '/cart/applyCoupon', { coupon: code }, c.token);
    await ctx.db.collection('coupons').updateOne({ name: code }, { $set: { expire: new Date(Date.now() - 1000) } });
    const res = await api('POST', '/order', {}, c.token);
    assert.equal(res.status, 400);
    assert.match(res.body.errors[0].message, /Coupon/);
  });

  it('quick-remove does not kill scheduled promotions that are not running now', async () => {
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', weekday: 'short' }).format(new Date()),
    );
    const scheduled = (await api('POST', '/promotions', { title: 'Other day', discountPercentage: 10, target: 'all', daysOfWeek: [(weekday + 2) % 7] }, admin.token)).body.data;
    await api('POST', '/promotions/quick-apply', { discountPercentage: 15 }, admin.token);
    const res = await api('POST', '/promotions/quick-remove', { target: 'all' }, admin.token);
    assert.equal(res.body.data.modifiedCount, 1);
    const after = (await api('GET', `/promotions/${scheduled._id}`)).body.data;
    assert.equal(after.isActive, true);
  });

  it('parallel wrong reset codes cannot exceed the attempt limit', async () => {
    const { email } = await (await import('./helpers.mjs')).signup();
    await api('POST', '/auth/forgotPassword', { email });
    await Promise.all(Array.from({ length: 20 }, () => api('POST', '/auth/verifyResetCode', { email, resetCode: '000000' })));
    const user = await ctx.db.collection('users').findOne({ email });
    assert.ok(user.passwordResetAttempts <= 5, `attempts=${user.passwordResetAttempts}`);
  });

  it('deleting an active order returns tracked stock', async () => {
    const cat = await createCategory(admin.token);
    const p = await createProduct(admin.token, cat._id, { trackStock: true, quantity: 3 });
    const c = await readyCustomer(admin.token, { items: [p] });
    const order = (await api('POST', '/order', {}, c.token)).body.data;
    assert.equal((await api('GET', `/products/${p._id}`)).body.data.quantity, 2);
    assert.equal((await api('DELETE', `/order/${order._id}`, null, admin.token)).status, 204);
    assert.equal((await api('GET', `/products/${p._id}`)).body.data.quantity, 3);
  });

  it('stock is returned even if tracking was switched off after ordering', async () => {
    const cat = await createCategory(admin.token);
    const p = await createProduct(admin.token, cat._id, { trackStock: true, quantity: 3 });
    const c = await readyCustomer(admin.token, { items: [p] });
    const order = (await api('POST', '/order', {}, c.token)).body.data;
    await api('PATCH', `/products/${p._id}`, { trackStock: false }, admin.token);
    await api('PATCH', `/order/${order._id}/reject`, { reason: 'test' }, admin.token);
    assert.equal((await api('GET', `/products/${p._id}`)).body.data.quantity, 3);
  });

  it('demoting a manager drops their live socket immediately', async () => {
    const manager = await staff('manager');
    const base = ctx.url.replace(/\/api\/v1$/, '');
    const socket = io(`${base}/realtime`, { auth: { token: manager.token }, transports: ['websocket'], reconnection: false });
    await new Promise((resolve, reject) => { socket.on('connect', resolve); socket.on('connect_error', reject); });
    const dropped = new Promise((resolve) => socket.on('disconnect', resolve));
    await api('PATCH', `/user/${manager.user._id}`, { role: 'user' }, admin.token);
    await Promise.race([dropped, new Promise((_, rej) => setTimeout(() => rej(new Error('socket still connected')), 3000))]);
    socket.close();
  });
});
