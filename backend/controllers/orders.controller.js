const db = require('../config/db');

const DELIVERY_FEE = 40;
const FREE_DELIVERY_ABOVE = 600;

exports.create = (req, res) => {
  const { name, phone, address, type, notes, items } = req.body || {};

  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
  if (!/^[0-9+\-\s]{10,15}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid phone number.' });
  if (!['delivery', 'pickup'].includes(type)) return res.status(400).json({ error: 'Choose delivery or pickup.' });
  if (type === 'delivery' && !address) return res.status(400).json({ error: 'A delivery address is required.' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Your cart is empty.' });

  const getItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1');
  const lines = [];
  for (const it of items) {
    const qty = Number(it.qty);
    const menuItem = getItem.get(Number(it.id));
    if (!menuItem || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return res.status(400).json({ error: 'One of the items in your cart is not valid.' });
    }
    lines.push({ menuItem, qty });
  }

  // Prices always come from the database, never from the browser.
  const subtotal = lines.reduce((sum, l) => sum + l.menuItem.price * l.qty, 0);
  const fee = type === 'delivery' && subtotal < FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const place = db.transaction(() => {
    const customer = db.prepare('INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)')
      .run(name.trim(), phone.trim(), type === 'delivery' ? address.trim() : null);
    const order = db.prepare(
      'INSERT INTO orders (customer_id, type, subtotal, delivery_fee, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(customer.lastInsertRowid, type, subtotal, fee, total, notes || null);
    const addLine = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
    );
    for (const l of lines) addLine.run(order.lastInsertRowid, l.menuItem.id, l.qty, l.menuItem.price);
    return order.lastInsertRowid;
  });

  const orderId = place();
  res.status(201).json({ id: orderId, subtotal, delivery_fee: fee, total, status: 'received' });
};

exports.get = (req, res) => {
  // Tracking needs the order number AND the phone used to place it.
  const digits = (v) => String(v || '').replace(/\D/g, '').slice(-10);
  const order = db.prepare(`
    SELECT o.*, c.name AS customer_name, c.phone AS customer_phone FROM orders o
    JOIN customers c ON c.id = o.customer_id WHERE o.id = ?`).get(req.params.id);
  if (!order || digits(order.customer_phone) !== digits(req.query.phone)) {
    return res.status(404).json({ error: 'No order found with that number and phone.' });
  }
  delete order.customer_phone;
  order.items = db.prepare(`
    SELECT m.name, oi.quantity, oi.unit_price FROM order_items oi
    JOIN menu_items m ON m.id = oi.menu_item_id WHERE oi.order_id = ?`).all(order.id);
  res.json(order);
};
