import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, ctx, setupApp, signup, staff, createCategory, createProduct, readyCustomer } from './helpers.mjs';

let admin;
setupApp(async () => {
  admin = await staff('admin');
});

const { activeWindowKey } = await import('../../dist/promotions/promotion-schedule.js');
const { PromotionNotifier } = await import('../../dist/promotions/promotion-notifier.js');

const cairoWeekday = () =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', weekday: 'short' }).format(new Date()),
  );

async function promo(body) {
  const res = await api('POST', '/promotions', body, admin.token);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data;
}
const remove = (p) => api('DELETE', `/promotions/${p._id}`, null, admin.token);

describe('M5 - schedule rules (Africa/Cairo)', () => {
  // 2026-11-20 is a Friday. Cairo is UTC+2 in November.
  const fri2300 = new Date('2026-11-20T21:00:00Z');
  const sat0100 = new Date('2026-11-20T23:00:00Z');
  const sat0300 = new Date('2026-11-21T01:00:00Z');
  const thu2300 = new Date('2026-11-19T21:00:00Z');
  const base = { isActive: true, startDate: new Date('2026-01-01'), daysOfWeek: [5] };

  it('overnight Friday window 22:00 -> 02:00 belongs to Friday', () => {
    const p = { ...base, startTime: '22:00', endTime: '02:00' };
    assert.equal(activeWindowKey(p, fri2300), '2026-11-20');
    assert.equal(activeWindowKey(p, sat0100), '2026-11-20');
    assert.equal(activeWindowKey(p, sat0300), null);
    assert.equal(activeWindowKey(p, thu2300), null);
  });

  it('day-only and one-off promotions', () => {
    assert.equal(activeWindowKey(base, fri2300), '2026-11-20');
    assert.equal(activeWindowKey(base, sat0100), null, 'Saturday local time');
    assert.equal(activeWindowKey({ isActive: true, startDate: new Date('2026-01-01') }, fri2300), 'once');
    assert.equal(activeWindowKey({ ...base, endDate: new Date('2026-11-01') }, fri2300), null);
    assert.equal(activeWindowKey({ ...base, isActive: false }, fri2300), null);
  });
});

describe('M5 - promotions affect prices everywhere', () => {
  it('whole-menu discount: menu, cart and order all agree', async () => {
    const c = await readyCustomer(admin.token, { price: 100 });
    const p = await promo({ title: 'Weekend 20%', discountPercentage: 20, target: 'all' });
    assert.equal(p.isRunning, true);

    const menu = await api('GET', `/products?category=${c.category._id}`);
    assert.equal(menu.body.data[0].finalPrice, 80);
    assert.equal(menu.body.data[0].activePromotion.discountPercentage, 20);
    const detail = await api('GET', `/products/${c.products[0]._id}`);
    assert.equal(detail.body.data.finalPrice, 80);

    const cart = await api('GET', '/cart', null, c.token);
    assert.equal(cart.body.data.subtotal, 80);
    assert.equal(cart.body.data.cartItems[0].basePrice, 100);

    const order = await api('POST', '/order', {}, c.token);
    assert.equal(order.status, 201, JSON.stringify(order.body));
    assert.equal(order.body.data.cartItems[0].price, 80);
    assert.equal(order.body.data.itemsDiscount, 20);
    assert.equal(order.body.data.subtotal, 80);
    await remove(p);
  });

  it('category / product targeting and best discount wins', async () => {
    const burgers = await createCategory(admin.token);
    const drinks = await createCategory(admin.token);
    const burger = await createProduct(admin.token, burgers._id, { price: 200 });
    const cola = await createProduct(admin.token, drinks._id, { price: 20 });

    const p1 = await promo({ title: 'Burgers 10%', discountPercentage: 10, target: 'category', categories: [burgers._id] });
    const p2 = await promo({ title: 'This burger 25%', discountPercentage: 25, target: 'products', products: [burger._id] });

    const b = (await api('GET', `/products/${burger._id}`)).body.data;
    const d = (await api('GET', `/products/${cola._id}`)).body.data;
    assert.equal(b.finalPrice, 150, 'best (25%) wins');
    assert.equal(b.activePromotion.title, 'This burger 25%');
    assert.equal(d.finalPrice, 20, 'other category untouched');
    await remove(p1);
    await remove(p2);
  });

  it('a permanent sale price beats a weaker promotion', async () => {
    const cat = await createCategory(admin.token);
    const item = await createProduct(admin.token, cat._id, { price: 100, priceAfterDiscount: 70 });
    const p = await promo({ title: '10%', discountPercentage: 10, target: 'products', products: [item._id] });
    const res = (await api('GET', `/products/${item._id}`)).body.data;
    assert.equal(res.finalPrice, 70);
    assert.equal(res.activePromotion, undefined);
    await remove(p);
  });

  it('future and other-day promotions do not apply yet', async () => {
    const cat = await createCategory(admin.token);
    const item = await createProduct(admin.token, cat._id, { price: 100 });
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const notToday = [(cairoWeekday() + 3) % 7];
    const future = await promo({ title: 'Future', discountPercentage: 50, target: 'products', products: [item._id], startDate: tomorrow });
    const otherDay = await promo({ title: 'Other day', discountPercentage: 40, target: 'products', products: [item._id], daysOfWeek: notToday });
    assert.equal(future.isRunning, false);
    assert.equal(otherDay.isRunning, false);
    assert.equal((await api('GET', `/products/${item._id}`)).body.data.finalPrice, 100);
    const active = (await api('GET', '/promotions/active')).body.data.map((x) => x._id);
    assert.ok(!active.includes(future._id) && !active.includes(otherDay._id));
    await remove(future);
    await remove(otherDay);
  });

  it('validates promotion input and permissions', async () => {
    const customer = await signup();
    assert.equal((await api('POST', '/promotions', { title: 'x', discountPercentage: 10 }, customer.token)).status, 403);
    assert.equal((await api('POST', '/promotions', { title: 'x', discountPercentage: 10, target: 'category' }, admin.token)).status, 400);
    assert.equal((await api('POST', '/promotions', { title: 'x', discountPercentage: 10, startTime: '18:00' }, admin.token)).status, 400);
    assert.equal((await api('POST', '/promotions', { title: 'x', discountPercentage: 95 }, admin.token)).status, 400);
    assert.equal((await api('POST', '/promotions', { title: 'x', discountPercentage: 10, daysOfWeek: [7] }, admin.token)).status, 400);
  });

  it('quick discount button starts now and can be stopped', async () => {
    const cat = await createCategory(admin.token);
    const item = await createProduct(admin.token, cat._id, { price: 50 });
    const res = await api('POST', '/promotions/quick-apply', { discountPercentage: 30, target: 'category', categoryId: cat._id }, admin.token);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.body.data.isRunning, true);
    assert.equal((await api('GET', `/products/${item._id}`)).body.data.finalPrice, 35);

    const stop = await api('POST', '/promotions/quick-remove', { target: 'category', categoryId: cat._id }, admin.token);
    assert.equal(stop.body.data.modifiedCount, 1);
    assert.equal((await api('GET', `/products/${item._id}`)).body.data.finalPrice, 50);
  });
});

describe('M5 - offer notifications', () => {
  it('notifies all customers once when an offer window opens', async () => {
    const customer = await signup();
    const p = await promo({ title: 'Happy hour', description: 'خصم 15% على المشروبات', discountPercentage: 15, target: 'all' });
    const notifier = ctx.app.get(PromotionNotifier);
    assert.ok((await notifier.tick()) >= 1);
    assert.equal(await notifier.tick(), 0, 'no duplicate for the same window');

    const inbox = await api('GET', '/notifications', null, customer.token);
    const n = inbox.body.data.find((x) => x.data.promotionId === p._id);
    assert.ok(n);
    assert.equal(n.type, 'promotion');
    assert.equal(n.body, 'خصم 15% على المشروبات');
    await remove(p);
  });

  it('home screen shows status, running offers and priced items', async () => {
    const p = await promo({ title: 'Home offer', discountPercentage: 10, target: 'all' });
    const home = await api('GET', '/home');
    assert.equal(home.status, 200);
    assert.equal(home.body.data.restaurant.name, 'Take Five');
    assert.ok(home.body.data.offers.some((o) => o._id === p._id));
    assert.ok(Array.isArray(home.body.data.bestSellers));
    await remove(p);
  });
});
