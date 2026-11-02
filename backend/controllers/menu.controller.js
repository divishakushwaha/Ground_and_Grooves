const db = require('../config/db');

exports.list = (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY id').all();
  res.json(items);
};
