const db = require('../config/db');

const TABLES_PER_SLOT = 8;          // how many bookings we accept for one time slot
const OPEN = '08:00', CLOSE = '22:00';

exports.create = (req, res) => {
  const { name, phone, date, time, guests, notes } = req.body || {};
  const n = Number(guests);

  if (!name || !phone || !date || !time) return res.status(400).json({ error: 'Please fill in all the required fields.' });
  if (!/^[0-9+\-\s]{10,15}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid phone number.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return res.status(400).json({ error: 'Invalid date or time.' });
  if (!Number.isInteger(n) || n < 1 || n > 12) return res.status(400).json({ error: 'We can seat 1 to 12 guests per booking.' });
  if (time < OPEN || time > CLOSE) return res.status(400).json({ error: `We are open from ${OPEN} to ${CLOSE}.` });

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return res.status(400).json({ error: 'Pick a date that is today or later.' });

  const { taken } = db.prepare(
    "SELECT COUNT(*) AS taken FROM reservations WHERE date = ? AND time = ? AND status = 'confirmed'"
  ).get(date, time);
  if (taken >= TABLES_PER_SLOT) return res.status(409).json({ error: 'That time is fully booked. Please choose another slot.' });

  const r = db.prepare(
    'INSERT INTO reservations (name, phone, date, time, guests, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name.trim(), phone.trim(), date, time, n, notes || null);

  res.status(201).json({ id: r.lastInsertRowid, name: name.trim(), date, time, guests: n, status: 'confirmed' });
};

exports.cancel = (req, res) => {
  const r = db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ? AND phone = ?")
    .run(req.params.id, (req.body && req.body.phone) || '');
  if (r.changes === 0) return res.status(404).json({ error: 'No booking found with that number and phone.' });
  res.json({ ok: true });
};
