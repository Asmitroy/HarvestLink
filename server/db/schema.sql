-- KisanConnect Database Schema
-- SQLite compatible

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ─────────────────────────────────────────────────────
-- USERS  (includes auth credentials)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('farmer','buyer','logistics')),
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  location      TEXT,
  location_lat  REAL,
  location_lng  REAL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────
-- PRODUCE LISTINGS  (farmers supply side)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produce_listings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_name TEXT,
  crop        TEXT    NOT NULL,
  qty         REAL    NOT NULL CHECK (qty > 0),
  price       REAL    NOT NULL CHECK (price > 0),
  status      TEXT    NOT NULL DEFAULT 'listed'
                CHECK (status IN ('listed','matched','assigned','fulfilled')),
  pos_x       REAL,
  pos_y       REAL,
  lat         REAL,
  lng         REAL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────
-- DEMAND POOL  (buyers demand side)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_pool (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_label     TEXT,
  crop            TEXT    NOT NULL,
  requested_qty   REAL    NOT NULL CHECK (requested_qty > 0),
  matched_qty     REAL    NOT NULL DEFAULT 0,
  target_price    REAL,
  status          TEXT    NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','matching','ready','fulfilled')),
  location        TEXT,
  deadline        TEXT,
  is_priority     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_listings_crop   ON produce_listings(crop);
CREATE INDEX IF NOT EXISTS idx_listings_status ON produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_demand_crop     ON demand_pool(crop);
CREATE INDEX IF NOT EXISTS idx_demand_status   ON demand_pool(status);
