// Shared bootstrap for the e2e suite. Boots the compiled app (dist/) in-process
// against a throw-away database and exposes a tiny fetch-based client.
import { after, before } from 'node:test';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.THROTTLE_DISABLED = 'true';
process.env.JWT_SECRET ??= 'e2e-secret-e2e-secret-e2e-secret-123456';
process.env.BASE_URL ??= 'http://localhost:5000';
const dbName = `takefive_e2e_${process.pid}`;
process.env.MONGO_URI = `${process.env.TEST_MONGO_URL ?? 'mongodb://localhost:27027'}/${dbName}?directConnection=true`;

const { NestFactory } = await import('@nestjs/core');
const { AppModule } = await import('../../dist/app.module.js');
const { configureApp } = await import('../../dist/app.setup.js');

export const ctx = { app: null, url: '', db: null, conn: null, cleanup: [] };

export function setupApp(afterStart) {
  before(async () => {
    const app = await NestFactory.create(AppModule, { logger: ['error'] });
    configureApp(app);
    await app.listen(0);
    ctx.app = app;
    ctx.url = (await app.getUrl()).replace('[::1]', 'localhost') + '/api/v1';
    ctx.conn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();
    ctx.db = ctx.conn.db;
    if (afterStart) await afterStart();
  });
  after(async () => {
    for (const fn of ctx.cleanup) await fn();
    await ctx.db?.dropDatabase();
    await ctx.conn?.close();
    await ctx.app?.close();
  });
}

export async function api(method, path, body, token) {
  const isForm = body instanceof FormData;
  const res = await fetch(ctx.url + path, {
    method,
    headers: {
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : undefined; } catch { json = text; }
  return { status: res.status, body: json };
}

let seq = 0;
export const uniq = (p = 'x') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export async function signup(extra = {}) {
  const email = `${uniq('u')}@test.com`;
  const res = await api('POST', '/auth/signup', {
    name: 'Test Customer',
    email,
    password: 'password123',
    phone: '01012345678',
    ...extra,
  });
  if (res.status !== 201) throw new Error(`signup failed ${res.status} ${JSON.stringify(res.body)}`);
  return { token: res.body.token, user: res.body.data, email };
}

/** Creates a staff account directly in the DB (no public route can do this). */
export async function staff(role = 'admin') {
  const { token, user, email } = await signup();
  await ctx.db.collection('users').updateOne(
    { _id: new mongoose.Types.ObjectId(user._id) },
    { $set: { role } },
  );
  return { token, user: { ...user, role }, email };
}

export async function createCategory(adminToken, name = uniq('Cat ')) {
  const res = await api('POST', '/categories', { name }, adminToken);
  if (res.status !== 201) throw new Error(`category failed ${JSON.stringify(res.body)}`);
  return res.body.data;
}

export async function createProduct(adminToken, categoryId, extra = {}) {
  const res = await api('POST', '/products', {
    title: uniq('Burger '),
    price: 100,
    category: categoryId,
    ...extra,
  }, adminToken);
  if (res.status !== 201) throw new Error(`product failed ${JSON.stringify(res.body)}`);
  return res.body.data;
}

export async function createZone(adminToken, extra = {}) {
  const res = await api('POST', '/delivery-zones', {
    name: uniq('Zone '),
    nameAr: 'منطقة',
    deliveryFee: 25,
    minOrderAmount: 0,
    estimatedDeliveryMinutes: 40,
    ...extra,
  }, adminToken);
  if (res.status !== 201) throw new Error(`zone failed ${JSON.stringify(res.body)}`);
  return res.body.data;
}

/** Customer with a default address in a fresh zone and a cart ready to checkout. */
export async function readyCustomer(adminToken, { zone, items = [], price = 100, ...productExtra } = {}) {
  const z = zone ?? (await createZone(adminToken));
  const cat = await createCategory(adminToken);
  const products = items.length ? items : [await createProduct(adminToken, cat._id, { price, ...productExtra })];
  const customer = await signup({ address: { zone: z._id, details: 'Group 12, Street 5', building: 'B12' } });
  for (const p of products) {
    const r = await api('POST', '/cart', { productId: p._id, quantity: 1 }, customer.token);
    if (r.status !== 201) throw new Error(`cart failed ${JSON.stringify(r.body)}`);
  }
  return { ...customer, zone: z, products, category: cat };
}
