-- ERAYA Initial PostgreSQL Schema Migration (001)
-- Safe & idempotent: uses IF NOT EXISTS and tracks applied versions in schema_migrations.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  availability TEXT NOT NULL,
  stock_count INTEGER,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  customisable BOOLEAN NOT NULL DEFAULT TRUE,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  pickup_preference TEXT NOT NULL DEFAULT '',
  customer_notes TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  upi_reference TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL,
  order_status TEXT NOT NULL,
  pickup_status TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  total INTEGER NOT NULL,
  sheets_sync_status TEXT NOT NULL DEFAULT 'PENDING',
  sheets_sync_attempts INTEGER NOT NULL DEFAULT 0,
  sheets_last_error TEXT,
  sheets_last_synced_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL,
  item_total INTEGER NOT NULL,
  customisation_details TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS custom_orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  request TEXT NOT NULL,
  budget TEXT NOT NULL DEFAULT '',
  reference_image_name TEXT,
  reference_image_data TEXT,
  status TEXT NOT NULL DEFAULT 'NEW'
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at BIGINT NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  ip TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT ''
);
