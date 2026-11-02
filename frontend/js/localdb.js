// Browser-only copy of the backend. It follows the same rules as backend/controllers/*
// and keeps data in localStorage, so the website works without Node.
const LocalAPI = (() => {
  const KEY = 'gg_localdb', DELIVERY_FEE = 40, FREE_ABOVE = 600, TABLES_PER_SLOT = 8, OPEN = '08:00', CLOSE = '22:00';
  const ORDER_STATUS = ['received', 'preparing', 'out_for_delivery', 'ready', 'completed', 'cancelled'];
  const fresh = () => ({ orders: [], reservations: [], messages: [], seq: { order: 0, res: 0, msg: 0 } });
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { return fresh(); } };
  const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));
  const fail = (m) => { throw new Error(m); };
  const digits = (v) => String(v || '').replace(/\D/g, '').slice(-10);
  const validPhone = (p) => /^[0-9+\-\s]{10,15}$/.test(p || '');
  const localToday = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function createOrder(b) {
    const { name, phone, address, type, notes, items } = b;
    if (!name || !phone) fail('Name and phone are required.');
    if (!validPhone(phone)) fail('Enter a valid phone number.');
    if (!['delivery', 'pickup'].includes(type)) fail('Choose delivery or pickup.');
    if (type === 'delivery' && !address) fail('A delivery address is required.');
    if (!Array.isArray(items) || !items.length) fail('Your cart is empty.');
    const lines = items.map((it) => {
      const m = MENU_DATA.find((x) => x.id === Number(it.id) && x.available), q = Number(it.qty);
      if (!m || !Number.isInteger(q) || q < 1 || q > 20) fail('One of the items in your cart is not valid.');
      return { name: m.name, quantity: q, unit_price: m.price };
    });
    const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
    const fee = type === 'delivery' && subtotal < FREE_ABOVE ? DELIVERY_FEE : 0;
    const d = load(); const id = ++d.seq.order;
    d.orders.push({ id, type, status: 'received', subtotal, delivery_fee: fee, total: subtotal + fee, notes: notes || null,
      created_at: new Date().toISOString(), customer_name: name.trim(), phone: phone.trim(), address: type === 'delivery' ? address.trim() : null, items: lines });
    save(d);
    return { id, subtotal, delivery_fee: fee, total: subtotal + fee, status: 'received' };
  }

  function getOrder(id, phone) {
    const o = load().orders.find((x) => x.id === Number(id));
    if (!o || digits(o.phone) !== digits(phone)) fail('No order found with that number and phone.');
    const { phone: _p, ...safe } = o;
    return safe;
  }

  function createReservation(b) {
    const { name, phone, date, time, guests, notes } = b, n = Number(guests);
    if (!name || !phone || !date || !time) fail('Please fill in all the required fields.');
    if (!validPhone(phone)) fail('Enter a valid phone number.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fail('Invalid date or time.');
    if (!Number.isInteger(n) || n < 1 || n > 12) fail('We can seat 1 to 12 guests per booking.');
    if (time < OPEN || time > CLOSE) fail(`We are open from ${OPEN} to ${CLOSE}.`);
    if (date < localToday()) fail('Pick a date that is today or later.');
    const d = load();
    if (d.reservations.filter((r) => r.date === date && r.time === time && r.status === 'confirmed').length >= TABLES_PER_SLOT)
      fail('That time is fully booked. Please choose another slot.');
    const id = ++d.seq.res;
    d.reservations.push({ id, name: name.trim(), phone: phone.trim(), date, time, guests: n, notes: notes || null, status: 'confirmed', created_at: new Date().toISOString() });
    save(d);
    return { id, name: name.trim(), date, time, guests: n, status: 'confirmed' };
  }

  function cancelReservation(id, phone) {
    const d = load(), r = d.reservations.find((x) => x.id === Number(id) && digits(x.phone) === digits(phone) && phone);
    if (!r) fail('No booking found with that number and phone.');
    r.status = 'cancelled'; save(d);
    return { ok: true };
  }

  function createMessage(b) {
    const { name, email, message } = b;
    if (!name || !email || !message) fail('Please fill in every field.');
    if (!/^\S+@\S+\.\S+$/.test(email)) fail('Enter a valid email address.');
    const d = load(); d.messages.push({ id: ++d.seq.msg, name: name.trim(), email: email.trim(), message: message.trim(), created_at: new Date().toISOString() });
    save(d); return { ok: true };
  }

  function admin(seg, body, headers) {
    if (headers['x-admin-key'] !== 'grove123') fail('Wrong staff key.');
    const d = load();
    if (seg[1] === 'summary') return {
      orders: [...d.orders].reverse().map((o) => ({ ...o, name: o.customer_name, items: o.items.map((i) => `${i.quantity} x ${i.name}`).join(', ') })),
      reservations: [...d.reservations].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
      messages: [...d.messages].reverse(),
    };
    const list = seg[1] === 'orders' ? d.orders : d.reservations;
    const allowed = seg[1] === 'orders' ? ORDER_STATUS : ['confirmed', 'cancelled'];
    const row = list.find((x) => x.id === Number(seg[2]));
    if (!allowed.includes(body.status)) fail('Unknown status.');
    if (!row) fail('Not found.');
    row.status = body.status; save(d);
    return { ok: true };
  }

  async function handle(path, method, body, headers) {
    const [p, qs] = path.split('?'); const seg = p.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
    if (seg[0] === 'menu') return MENU_DATA.filter((m) => m.available);
    if (seg[0] === 'orders' && method === 'POST') return createOrder(body);
    if (seg[0] === 'orders') return getOrder(seg[1], q.get('phone'));
    if (seg[0] === 'reservations' && seg[2] === 'cancel') return cancelReservation(seg[1], body.phone);
    if (seg[0] === 'reservations') return createReservation(body);
    if (seg[0] === 'contact') return createMessage(body);
    if (seg[0] === 'admin') return admin(seg, body, headers);
    fail('Not found.');
  }
  return { handle };
})();
