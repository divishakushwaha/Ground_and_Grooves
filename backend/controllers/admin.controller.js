const db = require('../config/db');

const ORDER_STATUS = ['received', 'preparing', 'out_for_delivery', 'ready', 'completed', 'cancelled'];
const RES_STATUS = ['confirmed', 'cancelled'];

// Very simple staff protection for a student project. Set ADMIN_KEY in the environment to change it.
exports.auth = (req, res, next) => {
  if ((req.get('x-admin-key') || '') !== (process.env.ADMIN_KEY || 'grove123')) {
    return res.status(401).json({ error: 'Wrong staff key.' });
  }
  next();
};

exports.summary = (req, res) => {
  const orders = db.prepare(`
    SELECT o.id, o.type, o.status, o.total, o.notes, o.created_at, c.name, c.phone, c.address,
      (SELECT group_concat(oi.quantity || ' x ' || m.name, ', ') FROM order_items oi
         JOIN menu_items m ON m.id = oi.menu_item_id WHERE oi.order_id = o.id) AS items
    FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id DESC`).all();
  const reservations = db.prepare('SELECT * FROM reservations ORDER BY date DESC, time DESC').all();
  const messages = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json({ orders, reservations, messages });
};

exports.setOrderStatus = (req, res) => {
  const status = req.body && req.body.status;
  if (!ORDER_STATUS.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  const r = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Order not found.' });
  res.json({ ok: true });
};

exports.setReservationStatus = (req, res) => {
  const status = req.body && req.body.status;
  if (!RES_STATUS.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  const r = db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Booking not found.' });
  res.json({ ok: true });
};
