import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, ctx, setupApp, signup, staff, createCategory, createProduct, uniq } from './helpers.mjs';

setupApp();

describe('M1 - access control', () => {
  it('a customer cannot escalate their own role', async () => {
    const { token, user } = await signup();
    const res = await api('PATCH', `/user/${user._id}`, { role: 'admin' }, token);
    assert.equal(res.status, 403);
  });

  it('a customer cannot list users, create users or reset other passwords', async () => {
    const { token } = await signup();
    const victim = await signup();
    assert.equal((await api('GET', '/user', null, token)).status, 403);
    assert.equal((await api('POST', '/user', { name: 'Evil', email: `${uniq()}@x.com`, password: 'password123', role: 'admin' }, token)).status, 403);
    assert.equal((await api('PATCH', `/user/changePassword/${victim.user._id}`, { password: 'hacked1234' }, token)).status, 403);
  });

  it('customers cannot manage the menu structure', async () => {
    const { token } = await signup();
    assert.equal((await api('POST', '/categories', { name: uniq('C') }, token)).status, 403);
    assert.equal((await api('POST', '/subcategories', { name: uniq('S'), category: '6650a0000000000000000000' }, token)).status, 403);
  });

  it('admin user listing never exposes password hashes or reset codes', async () => {
    const admin = await staff('admin');
    const res = await api('GET', '/user?limit=50', null, admin.token);
    assert.equal(res.status, 200);
    const raw = JSON.stringify(res.body);
    assert.ok(!raw.includes('"password"'));
    assert.ok(!raw.includes('passwordReset'));
  });

  it('change my password requires the current password and returns a working token', async () => {
    const { token, email } = await signup();
    const wrong = await api('PATCH', '/user/changeMyPassword', { currentPassword: 'nope-nope', password: 'newpass1234', passwordConfirm: 'newpass1234' }, token);
    assert.equal(wrong.status, 400);
    const ok = await api('PATCH', '/user/changeMyPassword', { currentPassword: 'password123', password: 'newpass1234', passwordConfirm: 'newpass1234' }, token);
    assert.equal(ok.status, 200);
    assert.equal((await api('GET', '/user/getMe', null, ok.body.token)).status, 200);
    assert.equal((await api('POST', '/auth/login', { email, password: 'newpass1234' })).status, 201);
  });
});

describe('M1 - input hardening', () => {
  it('rejects unknown / operator query params on the menu', async () => {
    const res = await api('GET', '/products?title[$ne]=x');
    assert.equal(res.status, 400);
  });

  it('regex special characters in search do not crash', async () => {
    const res = await api('GET', `/products?keyword=${encodeURIComponent('(a+)+$[')}`);
    assert.equal(res.status, 200);
  });

  it('malformed ids return 400 instead of 500', async () => {
    const res = await api('GET', '/products/not-an-id');
    assert.equal(res.status, 400);
  });

  it('validation errors include the field name', async () => {
    const res = await api('POST', '/auth/signup', { email: 'bad' });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some((e) => e.field === 'email'));
  });
});

describe('M1 - password reset', () => {
  it('does not reveal whether an email exists', async () => {
    const { email } = await signup();
    const a = await api('POST', '/auth/forgotPassword', { email });
    const b = await api('POST', '/auth/forgotPassword', { email: `${uniq()}@nobody.com` });
    assert.equal(a.status, b.status);
    assert.deepEqual(a.body, b.body);
  });

  it('locks the code after too many wrong attempts', async () => {
    const { email } = await signup();
    await api('POST', '/auth/forgotPassword', { email });
    for (let i = 0; i < 5; i++) {
      await api('POST', '/auth/verifyResetCode', { email, resetCode: '000000' });
    }
    const res = await api('POST', '/auth/verifyResetCode', { email, resetCode: '000000' });
    assert.equal(res.status, 400);
    assert.match(res.body.errors[0].message, /Too many/);
  });
});

describe('M1 - cart', () => {
  it('supports repeated adds, notes, quantity updates and clearing', async () => {
    const admin = await staff('admin');
    const cat = await createCategory(admin.token);
    const product = await createProduct(admin.token, cat._id, { price: 80 });
    const { token } = await signup();

    let res = await api('POST', '/cart', { productId: product._id }, token);
    assert.equal(res.status, 201);
    res = await api('POST', '/cart', { productId: product._id }, token);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.body.data.cartItems.length, 1);
    assert.equal(res.body.data.cartItems[0].quantity, 2);

    res = await api('POST', '/cart', { productId: product._id, notes: 'بدون بصل' }, token);
    assert.equal(res.body.data.cartItems.length, 2, 'different notes -> separate line');
    assert.equal(res.body.data.subtotal, 240);

    const lineId = res.body.data.cartItems[0]._id;
    res = await api('PATCH', `/cart/${lineId}`, { quantity: 5, notes: 'extra cheese' }, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.subtotal, 480);

    res = await api('DELETE', '/cart', null, token);
    assert.equal(res.body.data.cartItems.length, 0);
  });

  it('reprices the cart when the menu price changes', async () => {
    const admin = await staff('admin');
    const cat = await createCategory(admin.token);
    const product = await createProduct(admin.token, cat._id, { price: 100 });
    const { token } = await signup();
    await api('POST', '/cart', { productId: product._id, quantity: 2 }, token);
    await api('PATCH', `/products/${product._id}`, { price: 150 }, admin.token);
    const res = await api('GET', '/cart', null, token);
    assert.equal(res.body.data.subtotal, 300);
  });

  it('applies and validates coupons', async () => {
    const admin = await staff('admin');
    const cat = await createCategory(admin.token);
    const product = await createProduct(admin.token, cat._id, { price: 200 });
    const code = uniq('SAVE').toUpperCase();
    const c = await api('POST', '/coupon', { name: code, expire: new Date(Date.now() + 86400000).toISOString(), discount: 10 }, admin.token);
    assert.equal(c.status, 201, JSON.stringify(c.body));
    const { token } = await signup();
    await api('POST', '/cart', { productId: product._id }, token);
    assert.equal((await api('PATCH', '/cart/applyCoupon', { coupon: 'NOPE' }, token)).status, 400);
    const res = await api('PATCH', '/cart/applyCoupon', { coupon: code.toLowerCase() }, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.couponDiscount, 20);
    assert.equal(res.body.data.totalPriceAfterDiscount, 180);
  });

  it('unavailable items cannot be added', async () => {
    const admin = await staff('admin');
    const cat = await createCategory(admin.token);
    const product = await createProduct(admin.token, cat._id, { isAvailable: false });
    const { token } = await signup();
    assert.equal((await api('POST', '/cart', { productId: product._id }, token)).status, 400);
    const menu = await api('GET', `/products?category=${cat._id}`);
    assert.equal(menu.body.data.length, 0, 'hidden from customers');
  });
});
