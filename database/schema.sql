-- Grounds & Groves database schema (SQLite)

CREATE TABLE IF NOT EXISTS menu_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),   -- in rupees
  veg         INTEGER NOT NULL DEFAULT 1,           -- 1 = vegetarian
  image       TEXT,                                 -- file name inside frontend/assets/menu/
  available   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  phone   TEXT NOT NULL,
  email   TEXT,
  address TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  type        TEXT    NOT NULL CHECK (type IN ('delivery', 'pickup')),
  status      TEXT    NOT NULL DEFAULT 'received'
              CHECK (status IN ('received', 'preparing', 'out_for_delivery', 'ready', 'completed', 'cancelled')),
  subtotal    INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL,
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  date       TEXT    NOT NULL,           -- YYYY-MM-DD
  time       TEXT    NOT NULL,           -- HH:MM
  guests     INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
  notes      TEXT,
  status     TEXT    NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
