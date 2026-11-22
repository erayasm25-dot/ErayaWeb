/**
 * ERAYA Database Restore Script (non-destructive upsert from JSON backup)
 * Usage: node scripts/restore-db.mjs <path-to-backup.json>
 */
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { DatabaseSync } from "node:sqlite";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/restore-db.mjs <backup-file.json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));

async function restorePostgres(connStr) {
  const isLocal = connStr.includes("localhost") || connStr.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: connStr,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const p of data.products || []) {
      await client.query(
        `INSERT INTO products (id, slug, sku, name, category, category_name, price, availability, stock_count, is_new, is_featured, is_bestseller, is_demo, images, description, materials, customisable, tags, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16::jsonb,$17,$18::jsonb,$19)
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id, p.slug, p.sku, p.name, p.category, p.category_name, p.price, p.availability, p.stock_count,
          Boolean(p.is_new), Boolean(p.is_featured), Boolean(p.is_bestseller), Boolean(p.is_demo),
          typeof p.images === "string" ? p.images : JSON.stringify(p.images || []),
          p.description,
          typeof p.materials === "string" ? p.materials : JSON.stringify(p.materials || []),
          Boolean(p.customisable),
          typeof p.tags === "string" ? p.tags : JSON.stringify(p.tags || []),
          p.sort_order ?? 0,
        ]
      );
    }
    for (const o of data.orders || []) {
      await client.query(
        `INSERT INTO orders (id, created_at, updated_at, customer_name, phone, email, pickup_preference, customer_notes, payment_method, upi_reference, payment_status, order_status, pickup_status, subtotal, total, sheets_sync_status, sheets_sync_attempts, idempotency_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (id) DO NOTHING`,
        [
          o.id, o.created_at, o.updated_at, o.customer_name, o.phone, o.email || "", o.pickup_preference || "",
          o.customer_notes || "", o.payment_method, o.upi_reference || "", o.payment_status, o.order_status,
          o.pickup_status, o.subtotal, o.total, o.sheets_sync_status || "PENDING", o.sheets_sync_attempts || 0,
          o.idempotency_key || null,
        ]
      );
    }
    for (const it of data.orderItems || []) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_sku, product_name, category, quantity, unit_price, item_total, customisation_details)
         SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
         WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = $1 AND product_id = $2)`,
        [it.order_id, it.product_id, it.product_sku, it.product_name, it.category, it.quantity, it.unit_price, it.item_total, it.customisation_details || ""]
      );
    }
    await client.query("COMMIT");
    console.log(`Restored backup into PostgreSQL (${(data.orders || []).length} orders checked).`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

function restoreSqlite() {
  const dbPath = process.env.ERAYA_DB_PATH || path.join(process.cwd(), "data", "eraya.db");
  const db = new DatabaseSync(dbPath);
  db.exec("BEGIN");
  try {
    for (const o of data.orders || []) {
      db.prepare(
        `INSERT OR IGNORE INTO orders (id, created_at, updated_at, customer_name, phone, email, pickup_preference, customer_notes, payment_method, upi_reference, payment_status, order_status, pickup_status, subtotal, total, sheets_sync_status, sheets_sync_attempts, idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        o.id, o.created_at, o.updated_at, o.customer_name, o.phone, o.email || "", o.pickup_preference || "",
        o.customer_notes || "", o.payment_method, o.upi_reference || "", o.payment_status, o.order_status,
        o.pickup_status, o.subtotal, o.total, o.sheets_sync_status || "PENDING", o.sheets_sync_attempts || 0,
        o.idempotency_key || null
      );
    }
    db.exec("COMMIT");
    console.log(`Restored backup into SQLite (${(data.orders || []).length} orders checked).`);
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    db.close();
  }
}

if (process.env.DATABASE_URL?.trim()) {
  restorePostgres(process.env.DATABASE_URL.trim()).catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  restoreSqlite();
}
