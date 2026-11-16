import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { api, ctx, setupApp, signup, staff, readyCustomer } from './helpers.mjs';

let admin;
setupApp(async () => {
  admin = await staff('admin');
});

const sockets = [];
function connect(token) {
  const base = ctx.url.replace(/\/api\/v1$/, '');
  return new Promise((resolve, reject) => {
    const s = io(`${base}/realtime`, { auth: { token }, transports: ['websocket'], reconnection: false });
    sockets.push(s);
    s.on('connect', () => resolve(s));
    s.on('connect_error', (e) => reject(e));
  });
}
function waitFor(socket, event, predicate = () => true, ms = 4000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), ms);
    socket.on(event, (payload) => {
      if (predicate(payload)) {
        clearTimeout(t);
        resolve(payload);
      }
    });
  });
}

describe('M4 - realtime', () => {
  it('rejects sockets without a valid token', async () => {
    await assert.rejects(connect('garbage'), /Unauthorized/);
  });

  it('staff get the new order (with customer data + alarm flag) and the customer gets live status', async () => {
    const staffSocket = await connect(admin.token);
    const c = await readyCustomer(admin.token);
    const customerSocket = await connect(c.token);

    const newOrder = waitFor(staffSocket, 'order:new');
    const pending = waitFor(staffSocket, 'orders:pending_count', (p) => p.count >= 1);
    const created = await api('POST', '/order', { notes: 'من غير بصل' }, c.token);
    assert.equal(created.status, 201);
    const orderId = created.body.data._id;

    const evt = await newOrder;
    assert.equal(evt.playSound, true);
    assert.equal(evt.order._id, orderId);
    assert.equal(evt.order.customer.phone, '01012345678');
    assert.equal(evt.order.notes, 'من غير بصل');
    assert.ok((await pending).count >= 1);

    const updated = waitFor(customerSocket, 'order:updated', (p) => p._id === orderId);
    const notif = waitFor(customerSocket, 'notification:new', (n) => n.data?.orderId === orderId);
    await api('PATCH', `/order/${orderId}/accept`, { estimatedDeliveryMinutes: 25 }, admin.token);
    const u = await updated;
    assert.equal(u.status, 'accepted');
    assert.ok(u.remainingMinutes <= 25 && u.remainingMinutes >= 24);
    const n = await notif;
    assert.match(n.title, /تم قبول طلبك/);
    assert.match(n.body, /25/);
  });

  it('customers do not receive staff events', async () => {
    const other = await signup();
    const s = await connect(other.token);
    let leaked = false;
    s.on('order:new', () => (leaked = true));
    const c = await readyCustomer(admin.token);
    await api('POST', '/order', {}, c.token);
    await new Promise((r) => setTimeout(r, 400));
    assert.equal(leaked, false);
  });

  it('restaurant pause is broadcast to everyone', async () => {
    const c = await signup();
    const s = await connect(c.token);
    const evt = waitFor(s, 'restaurant:status', (p) => p.acceptingOrders === false);
    await api('PATCH', '/settings/accepting-orders', { acceptingOrders: false }, admin.token);
    assert.equal((await evt).isOpen, false);
    await api('PATCH', '/settings/accepting-orders', { acceptingOrders: true }, admin.token);
  });
});

describe('M4 - notifications inbox & devices', () => {
  it('order updates land in the customer inbox with unread badge', async () => {
    const c = await readyCustomer(admin.token);
    const order = (await api('POST', '/order', {}, c.token)).body.data;
    await api('PATCH', `/order/${order._id}/reject`, { reason: 'لا يوجد مناديب متاحين حالياً' }, admin.token);
    await new Promise((r) => setTimeout(r, 200));

    const inbox = await api('GET', '/notifications', null, c.token);
    assert.equal(inbox.status, 200);
    const item = inbox.body.data.find((n) => n.data.orderId === order._id);
    assert.ok(item);
    assert.equal(item.body, 'لا يوجد مناديب متاحين حالياً');
    assert.equal(item.isRead, false);
    assert.ok(inbox.body.meta.unreadCount >= 1);

    await api('PATCH', `/notifications/${item._id}/read`, null, c.token);
    const after = await api('GET', '/notifications/unread-count', null, c.token);
    assert.equal(after.body.data.unreadCount, inbox.body.meta.unreadCount - 1);
  });

  it('broadcast offers reach existing customers and can be marked read', async () => {
    const c = await signup();
    const customer = await signup();
    assert.equal((await api('POST', '/notifications/broadcast', { title: 'x', body: 'y' }, customer.token)).status, 403);
    const res = await api('POST', '/notifications/broadcast', { title: 'خصم 20%', body: 'على كل البرجر' }, admin.token);
    assert.equal(res.status, 201);

    let inbox = await api('GET', '/notifications', null, c.token);
    assert.ok(inbox.body.data.some((n) => n.title === 'خصم 20%' && n.isRead === false));
    await api('PATCH', '/notifications/read-all', null, c.token);
    inbox = await api('GET', '/notifications', null, c.token);
    assert.equal(inbox.body.meta.unreadCount, 0);
    assert.ok(inbox.body.data.every((n) => n.isRead));

    const late = await signup();
    const lateInbox = await api('GET', '/notifications', null, late.token);
    assert.ok(!lateInbox.body.data.some((n) => n.title === 'خصم 20%'), 'accounts created later do not see old offers');
  });

  it('registers and removes device tokens', async () => {
    const c = await signup();
    const reg = await api('POST', '/notifications/devices', { token: 'fcm-token-abc', platform: 'android' }, c.token);
    assert.equal(reg.status, 201);
    assert.equal(reg.body.data.app, 'customer');
    // same physical device, other account logs in -> token moves
    const d = await signup();
    await api('POST', '/notifications/devices', { token: 'fcm-token-abc', platform: 'android' }, d.token);
    const count = await ctx.db.collection('devicetokens').countDocuments({ token: 'fcm-token-abc' });
    assert.equal(count, 1);
    assert.equal((await api('DELETE', '/notifications/devices/fcm-token-abc', null, d.token)).status, 204);
    assert.equal(await ctx.db.collection('devicetokens').countDocuments({ token: 'fcm-token-abc' }), 0);
  });
});

ctx.cleanup.push(() => sockets.forEach((s) => s.close()));
