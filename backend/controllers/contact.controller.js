const db = require('../config/db');

exports.create = (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Please fill in every field.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run(name.trim(), email.trim(), message.trim());
  res.status(201).json({ ok: true });
};
