-- ERAYA Migration 002: Add bestseller_order for persistent admin ordering
-- Safe & non-destructive: preserves all existing product rows.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS bestseller_order INTEGER NOT NULL DEFAULT 0;
