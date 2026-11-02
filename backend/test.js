// Quick end-to-end check of the API. Run with: npm test
process.env.DB_FILE = ':memory:';
const assert = require('assert');
const app = require('./server');

const server = app.listen(0, async () => {
  const base = `http://localhost:${server.address().port}/api`;
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const menu = await (await fetch(base + '/menu')).json();
    assert(menu.length >= 10, 'menu should be seeded');

    let r = await post('/orders', { name: 'Test', phone: '9876543210', type: 'delivery', address: '12 MG Road', items: [{ id: 1, qty: 2 }] });
    const order = await r.json();
    assert.strictEqual(r.status, 201);
    assert.strictEqual(order.total, 120 * 2 + 40, 'delivery fee applied under the free-delivery limit');

    let t = await fetch(base + '/orders/' + order.id + '?phone=9876543210');
    assert.strictEqual(t.status, 200, 'tracking works with the right phone');
    t = await fetch(base + '/orders/' + order.id + '?phone=1111111111');
    assert.strictEqual(t.status, 404, 'tracking hidden with the wrong phone');

    r = await post('/orders', { name: 'Test', phone: '9876543210', type: 'delivery', items: [{ id: 1, qty: 1 }] });
    assert.strictEqual(r.status, 400, 'delivery needs an address');

    r = await post('/reservations', { name: 'Asha', phone: '9876543210', date: '2999-01-01', time: '19:00', guests: 4 });
    assert.strictEqual(r.status, 201);
    r = await post('/reservations', { name: 'Asha', phone: '9876543210', date: '2000-01-01', time: '19:00', guests: 4 });
    assert.strictEqual(r.status, 400, 'past dates rejected');

    r = await post('/contact', { name: 'Ravi', email: 'ravi@example.com', message: 'Hello' });
    assert.strictEqual(r.status, 201);

    t = await fetch(base + '/admin/summary');
    assert.strictEqual(t.status, 401, 'admin needs a key');
    const key = { 'x-admin-key': 'grove123', 'Content-Type': 'application/json' };
    const sum = await (await fetch(base + '/admin/summary', { headers: key })).json();
    assert(sum.orders.length === 1 && sum.reservations.length === 1 && sum.messages.length === 1);
    t = await fetch(base + '/admin/orders/' + order.id + '/status', { method: 'POST', headers: key, body: JSON.stringify({ status: 'preparing' }) });
    assert.strictEqual(t.status, 200);

    console.log('All API checks passed.');
  } catch (e) { console.error('FAILED:', e.message); process.exitCode = 1; }
  server.close();
});
