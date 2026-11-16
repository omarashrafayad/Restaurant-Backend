import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, setupApp, signup, staff, createZone, uniq } from './helpers.mjs';

setupApp();

describe('M2 - restaurant settings', () => {
  it('exposes Take Five profile and status publicly', async () => {
    const res = await api('GET', '/settings');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, 'Take Five');
    assert.equal(res.body.data.isOpen, true);
    assert.ok(Array.isArray(res.body.data.openingHours));
  });

  it('only admins can edit settings; the phone becomes visible to customers', async () => {
    const customer = await signup();
    assert.equal((await api('PATCH', '/settings', { phone: '01111111111' }, customer.token)).status, 403);
    const admin = await staff('admin');
    const res = await api('PATCH', '/settings', { phone: '01000000000', whatsapp: '201000000000' }, admin.token);
    assert.equal(res.status, 200);
    assert.equal((await api('GET', '/settings')).body.data.phone, '01000000000');
  });

  it('validates opening hours format', async () => {
    const admin = await staff('admin');
    const res = await api('PATCH', '/settings', { openingHours: [{ day: 1, open: '25:00', close: '10:00' }] }, admin.token);
    assert.equal(res.status, 400);
  });

  it('closed outside opening hours, open across midnight', async () => {
    const admin = await staff('admin');
    // closed every day
    let res = await api('PATCH', '/settings', {
      openingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '00:00', close: '00:01', closed: true })),
    }, admin.token);
    assert.equal(res.status, 200);
    let status = (await api('GET', '/settings')).body.data;
    assert.equal(status.isOpen, false);
    assert.equal(status.withinOpeningHours, false);

    // 24h via overnight slots every day
    res = await api('PATCH', '/settings', {
      openingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: '00:00', close: '00:00' })),
    }, admin.token);
    status = (await api('GET', '/settings')).body.data;
    assert.equal(status.isOpen, true);
    await api('PATCH', '/settings', { openingHours: [] }, admin.token);
  });

  it('manager can pause and resume orders', async () => {
    const manager = await staff('manager');
    let res = await api('PATCH', '/settings/accepting-orders', { acceptingOrders: false, pausedMessage: 'راجعين بعد نص ساعة' }, manager.token);
    assert.equal(res.status, 200);
    let status = (await api('GET', '/settings')).body.data;
    assert.equal(status.isOpen, false);
    assert.equal(status.message, 'راجعين بعد نص ساعة');
    res = await api('PATCH', '/settings/accepting-orders', { acceptingOrders: true }, manager.token);
    assert.equal((await api('GET', '/settings')).body.data.isOpen, true);
  });
});

describe('M2 - signup & addresses with delivery zones', () => {
  it('requires a valid Egyptian mobile number', async () => {
    const base = { name: 'No Phone', email: `${uniq()}@t.com`, password: 'password123' };
    assert.equal((await api('POST', '/auth/signup', base)).status, 400);
    assert.equal((await api('POST', '/auth/signup', { ...base, phone: '12345' })).status, 400);
    const ok = await api('POST', '/auth/signup', { ...base, phone: '+201012345678' });
    assert.equal(ok.status, 201);
    assert.equal(ok.body.data.phone, '01012345678');
  });

  it('active zones list hides inactive zones', async () => {
    const admin = await staff('admin');
    const active = await createZone(admin.token, { name: uniq('Madinaty ') });
    const inactive = await createZone(admin.token, { name: uniq('Closed '), isActive: false });
    const res = await api('GET', '/delivery-zones/active');
    const ids = res.body.data.map((z) => z._id);
    assert.ok(ids.includes(active._id));
    assert.ok(!ids.includes(inactive._id));
  });

  it('saves the signup address with its zone and location', async () => {
    const admin = await staff('admin');
    const zone = await createZone(admin.token, { name: uniq('Shorouk '), deliveryFee: 30 });
    const { token } = await signup({
      address: { zone: zone._id, details: 'Street 1', floor: '2', coordinates: { lat: 30.1, lng: 31.6 }, locationUrl: 'https://maps.google.com/?q=30.1,31.6' },
    });
    const res = await api('GET', '/addresses', null, token);
    assert.equal(res.body.data.length, 1);
    const addr = res.body.data[0];
    assert.equal(addr.city, zone.name);
    assert.equal(addr.zone.deliveryFee, 30);
    assert.equal(addr.isDefault, true);
    assert.equal(addr.phone, '01012345678');
    assert.deepEqual(addr.coordinates, { lat: 30.1, lng: 31.6 });
  });

  it('refuses addresses in inactive zones and invalid coordinates', async () => {
    const admin = await staff('admin');
    const inactive = await createZone(admin.token, { isActive: false });
    const { token } = await signup();
    assert.equal((await api('POST', '/addresses', { zone: inactive._id, details: 'x street' }, token)).status, 400);
    const zone = await createZone(admin.token);
    assert.equal((await api('POST', '/addresses', { zone: zone._id, details: 'x', coordinates: { lat: 200, lng: 0 } }, token)).status, 400);
  });

  it('add, update default and delete addresses', async () => {
    const admin = await staff('admin');
    const zone = await createZone(admin.token);
    const { token } = await signup();
    const a = (await api('POST', '/addresses', { zone: zone._id, details: 'Home street', alias: 'Home' }, token)).body.data;
    const b = (await api('POST', '/addresses', { zone: zone._id, details: 'Work street', alias: 'Work' }, token)).body.data;
    assert.equal(a.isDefault, true);
    assert.equal(b.isDefault, false);

    const upd = await api('PATCH', `/addresses/${b._id}`, { isDefault: true, landmark: 'Near the mall' }, token);
    assert.equal(upd.status, 200);
    let list = (await api('GET', '/addresses', null, token)).body.data;
    assert.equal(list.find((x) => x._id === b._id).isDefault, true);
    assert.equal(list.find((x) => x._id === a._id).isDefault, false);

    assert.equal((await api('DELETE', `/addresses/${b._id}`, null, token)).status, 204);
    list = (await api('GET', '/addresses', null, token)).body.data;
    assert.equal(list.length, 1);
    assert.equal(list[0].isDefault, true, 'remaining address becomes default');
  });
});
