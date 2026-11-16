import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, setupApp, signup, staff, createZone, createCategory, createProduct, readyCustomer } from './helpers.mjs';

let admin;
setupApp(async () => {
  admin = await staff('admin');
  await api('PATCH', '/settings', { phone: '01000000000', whatsapp: '201000000000' }, admin.token);
});

describe('M3 - checkout', () => {
  it('preview shows delivery fee, minimum order and blocking issues', async () => {
    const zone = await createZone(admin.token, { deliveryFee: 30, minOrderAmount: 150 });
    const c = await readyCustomer(admin.token, { zone, price: 100 });
    let res = await api('POST', '/order/preview', {}, c.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.deliveryFee, 30);
    assert.equal(res.body.data.canPlaceOrder, false);
    assert.match(res.body.data.issues[0], /Minimum order/);
    assert.equal((await api('POST', '/order', {}, c.token)).status, 400);

    await api('POST', '/cart', { productId: c.products[0]._id }, c.token);
    res = await api('POST', '/order/preview', {}, c.token);
    assert.equal(res.body.data.canPlaceOrder, true);
    assert.equal(res.body.data.subtotal, 200);
    assert.equal(res.body.data.total, 230);
  });

  it('places an order with item notes, snapshot, number, and restaurant contact', async () => {
    const zone = await createZone(admin.token, { deliveryFee: 20, estimatedDeliveryMinutes: 35 });
    const c = await readyCustomer(admin.token, { zone, price: 90 });
    await api('POST', '/cart', { productId: c.products[0]._id, notes: 'بدون بصل', quantity: 2 }, c.token);

    const res = await api('POST', '/order', { notes: 'كلمني لما توصل' }, c.token);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const order = res.body.data;
    assert.ok(order.orderNumber > 1000);
    assert.equal(order.status, 'pending');
    assert.equal(order.subtotal, 270);
    assert.equal(order.shippingPrice, 20);
    assert.equal(order.totalOrderPrice, 290);
    assert.equal(order.notes, 'كلمني لما توصل');
    assert.ok(order.cartItems.some((i) => i.notes === 'بدون بصل' && i.quantity === 2));
    assert.ok(order.cartItems[0].title);
    assert.equal(order.restaurant.phone, '01000000000');
    assert.equal(order.customer.phone, '01012345678');
    assert.equal(order.shippingAddress.city, zone.name);
    assert.equal(order.canCancel, true);
    assert.equal(order.estimatedDeliveryMinutes, 35);

    const cart = await api('GET', '/cart', null, c.token);
    assert.equal(cart.body.data.cartItems.length, 0, 'cart emptied');
  });

  it('blocks orders when the restaurant is paused', async () => {
    const c = await readyCustomer(admin.token);
    await api('PATCH', '/settings/accepting-orders', { acceptingOrders: false }, admin.token);
    const res = await api('POST', '/order', {}, c.token);
    await api('PATCH', '/settings/accepting-orders', { acceptingOrders: true }, admin.token);
    assert.equal(res.status, 400);
  });

  it('blocks orders with unavailable items and with no address', async () => {
    const c = await readyCustomer(admin.token);
    await api('PATCH', `/products/${c.products[0]._id}`, { isAvailable: false }, admin.token);
    assert.equal((await api('POST', '/order', {}, c.token)).status, 400);

    const noAddress = await signup();
    const cat = await createCategory(admin.token);
    const p = await createProduct(admin.token, cat._id);
    await api('POST', '/cart', { productId: p._id }, noAddress.token);
    const res = await api('POST', '/order', {}, noAddress.token);
    assert.equal(res.status, 400);
    assert.match(res.body.errors[0].message, /address/i);
  });

  it('enforces stock for tracked items atomically', async () => {
    const cat = await createCategory(admin.token);
    const p = await createProduct(admin.token, cat._id, { trackStock: true, quantity: 1 });
    const a = await readyCustomer(admin.token, { items: [p] });
    const b = await readyCustomer(admin.token, { items: [p] });
    const results = await Promise.all([api('POST', '/order', {}, a.token), api('POST', '/order', {}, b.token)]);
    const statuses = results.map((r) => r.status).sort();
    assert.deepEqual(statuses, [201, 400]);
    const product = (await api('GET', `/products/${p._id}`)).body.data;
    assert.equal(product.quantity, 0);
  });
});

describe('M3 - order lifecycle', () => {
  async function placeOrder(extra = {}) {
    const c = await readyCustomer(admin.token, extra);
    const res = await api('POST', '/order', {}, c.token);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return { customer: c, order: res.body.data };
  }

  it('staff see new orders with customer details and can search by number', async () => {
    const { order } = await placeOrder();
    const list = await api('GET', '/order?status=pending', null, admin.token);
    const found = list.body.data.find((o) => o._id === order._id);
    assert.ok(found);
    assert.equal(found.customer.phone, '01012345678');
    const search = await api('GET', `/order?keyword=%23${order.orderNumber}`, null, admin.token);
    assert.equal(search.body.data.length, 1);
  });

  it('accept -> preparing -> on the way -> delivered with countdown and timeline', async () => {
    const { customer, order } = await placeOrder();
    let res = await api('PATCH', `/order/${order._id}/accept`, { estimatedDeliveryMinutes: 30 }, admin.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.estimatedDeliveryTime);
    assert.ok(res.body.data.remainingMinutes >= 29 && res.body.data.remainingMinutes <= 30);

    assert.equal((await api('PATCH', `/order/${order._id}/accept`, {}, admin.token)).status, 400, 'cannot accept twice');
    assert.equal((await api('PATCH', `/order/${order._id}/reject`, { reason: 'x' }, admin.token)).status, 400, 'cannot reject after accept');
    assert.equal((await api('PATCH', `/order/${order._id}/cancel`, {}, customer.token)).status, 400, 'customer cannot cancel after accept');

    for (const status of ['preparing', 'on_the_way', 'delivered']) {
      res = await api('PATCH', `/order/${order._id}/status`, { status }, admin.token);
      assert.equal(res.status, 200, `${status}: ${JSON.stringify(res.body)}`);
    }
    const final = res.body.data;
    assert.equal(final.status, 'delivered');
    assert.equal(final.isPaid, true, 'cash collected on delivery');
    assert.equal(final.remainingMinutes, 0);
    assert.deepEqual(final.statusHistory.map((h) => h.status), ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered']);
    assert.equal(final.canReview, false, 'staff view');
    const mine = await api('GET', `/order/${order._id}`, null, customer.token);
    assert.equal(mine.body.data.canReview, true);
  });

  it('reject requires a reason and restores tracked stock', async () => {
    const cat = await createCategory(admin.token);
    const p = await createProduct(admin.token, cat._id, { trackStock: true, quantity: 5 });
    const { order, customer } = await placeOrder({ items: [p] });
    assert.equal((await api('GET', `/products/${p._id}`)).body.data.quantity, 4);
    assert.equal((await api('PATCH', `/order/${order._id}/reject`, { reason: '' }, admin.token)).status, 400);
    const res = await api('PATCH', `/order/${order._id}/reject`, { reason: 'خارج نطاق التوصيل' }, admin.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.rejectionReason, 'خارج نطاق التوصيل');
    assert.equal((await api('GET', `/products/${p._id}`)).body.data.quantity, 5);
    const mine = await api('GET', `/order/${order._id}`, null, customer.token);
    assert.equal(mine.body.data.status, 'rejected');
  });

  it('customer can cancel only while pending', async () => {
    const { order, customer } = await placeOrder();
    const res = await api('PATCH', `/order/${order._id}/cancel`, { reason: 'Ordered by mistake' }, customer.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'cancelled');
    assert.equal(res.body.data.cancelledBy, 'customer');
  });

  it('two cashiers accepting at once: exactly one wins', async () => {
    const { order } = await placeOrder();
    const manager = await staff('manager');
    const results = await Promise.all([
      api('PATCH', `/order/${order._id}/accept`, {}, admin.token),
      api('PATCH', `/order/${order._id}/accept`, {}, manager.token),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  });

  it('customers cannot see, cancel or accept other customers orders', async () => {
    const { order } = await placeOrder();
    const other = await signup();
    assert.equal((await api('GET', `/order/${order._id}`, null, other.token)).status, 404);
    assert.equal((await api('PATCH', `/order/${order._id}/cancel`, {}, other.token)).status, 404);
    assert.equal((await api('PATCH', `/order/${order._id}/accept`, {}, other.token)).status, 403);
    const list = await api('GET', '/order', null, other.token);
    assert.equal(list.body.data.length, 0);
  });

  it('rating with stars + comment only after delivery, once', async () => {
    const { order, customer } = await placeOrder();
    assert.equal((await api('POST', `/order/${order._id}/review`, { ratings: 5 }, customer.token)).status, 400);
    await api('PATCH', `/order/${order._id}/accept`, {}, admin.token);
    await api('PATCH', `/order/${order._id}/status`, { status: 'on_the_way' }, admin.token);
    await api('PATCH', `/order/${order._id}/deliver`, null, admin.token);
    const res = await api('POST', `/order/${order._id}/review`, { ratings: 4, comment: 'الأكل كان سخن' }, customer.token);
    assert.equal(res.status, 201);
    assert.equal(res.body.data.review.ratings, 4);
    assert.equal((await api('POST', `/order/${order._id}/review`, { ratings: 1 }, customer.token)).status, 400);
  });

  it('active orders endpoint and reorder', async () => {
    const { order, customer } = await placeOrder();
    const active = await api('GET', '/order/active', null, customer.token);
    assert.equal(active.body.results, 1);
    assert.equal(active.body.restaurant.phone, '01000000000');

    const re = await api('POST', `/order/${order._id}/reorder`, null, customer.token);
    assert.equal(re.status, 201);
    assert.equal(re.body.data.cartItems.length, 1);
  });
});
