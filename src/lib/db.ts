import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Pool } from "pg";
import { DatabaseSync } from "node:sqlite";
import { Product } from "@/types/product";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import {
  OrderRecord,
  OrderItemRecord,
  CustomOrderRecord,
  PublicOwnerSettings,
  AdminOwnerSettings,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  PickupStatus,
  SheetsSyncStatus,
} from "@/types/order";

const usePostgres = () => Boolean(process.env.DATABASE_URL?.trim());

let _pgPool: Pool | null = null;
let _pgReady: Promise<void> | null = null;
let _sqliteDb: DatabaseSync | null = null;

/* -------------------------------------------------------------------------- */
/*  Driver Initialization & Migrations                                        */
/* -------------------------------------------------------------------------- */

function getPgPool(): Pool {
  if (_pgPool) return _pgPool;
  const connStr = process.env.DATABASE_URL!.trim();
  const isLocal = connStr.includes("localhost") || connStr.includes("127.0.0.1");
  _pgPool = new Pool({
    connectionString: connStr,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
  });
  return _pgPool;
}

async function ensurePg(): Promise<Pool> {
  const pool = getPgPool();
  if (!_pgReady) {
    _pgReady = (async () => {
      const migrationPath = path.join(process.cwd(), "migrations", "001_initial_postgres.sql");
      const sql = fs.readFileSync(migrationPath, "utf8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        const applied = await client.query(
          "SELECT version FROM schema_migrations WHERE version = '001_initial_postgres'"
        );
        if (applied.rowCount === 0) {
          await client.query(
            "INSERT INTO schema_migrations (version) VALUES ('001_initial_postgres') ON CONFLICT DO NOTHING"
          );
        }

        const mig002 = await client.query(
          "SELECT version FROM schema_migrations WHERE version = '002_bestseller_order'"
        );
        if (mig002.rowCount === 0) {
          const sql002 = fs.readFileSync(
            path.join(process.cwd(), "migrations", "002_bestseller_order.sql"),
            "utf8"
          );
          await client.query(sql002);
          await client.query(
            "INSERT INTO schema_migrations (version) VALUES ('002_bestseller_order') ON CONFLICT DO NOTHING"
          );
        }

        // Seed products only if empty
        const { rows: countRows } = await client.query("SELECT COUNT(*)::int AS c FROM products");
        if (countRows[0].c === 0) {
          for (const p of MOCK_PRODUCTS) {
            await client.query(
              `INSERT INTO products (
                id, slug, sku, name, category, category_name, price, availability, stock_count,
                is_new, is_featured, is_bestseller, is_demo, images, description, materials,
                customisable, tags, sort_order
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16::jsonb,$17,$18::jsonb,$19)`,
              [
                p.id, p.slug, p.sku, p.name, p.category, p.categoryName, p.price, p.availability,
                p.stockCount ?? null, Boolean(p.isNew), Boolean(p.isFeatured), Boolean(p.isBestseller),
                Boolean(p.isDemo), JSON.stringify(p.images), p.description, JSON.stringify(p.materials),
                p.customisable !== false, JSON.stringify(p.tags), p.order,
              ]
            );
          }
        }

        const defaults: Record<string, string> = {
          upi_id: "eraya@upi",
          upi_name: "ERAYA Handmade",
          upi_qr_image: "",
          pickup_address:
            "Self-pickup location & timing will be confirmed via WhatsApp / Instagram DM after order review.",
          pickup_slots: JSON.stringify([
            "Weekday Evening",
            "Weekend Afternoon",
            "Flexible — contact me to schedule",
          ]),
          google_sheets_webhook_url: "",
          google_sheets_secret: "",
        };
        for (const [k, v] of Object.entries(defaults)) {
          await client.query(
            "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
            [k, v]
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        _pgReady = null;
        throw err;
      } finally {
        client.release();
      }
    })();
  }
  await _pgReady;
  return pool;
}

function getSqlite(): DatabaseSync {
  if (_sqliteDb) return _sqliteDb;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_LOCAL_SQLITE !== "true" &&
    !process.env.ERAYA_DB_PATH
  ) {
    throw new Error(
      "DATABASE_URL is required in production. Ephemeral SQLite is disabled to protect order persistence."
    );
  }

  const dbPath =
    process.env.ERAYA_DB_PATH ||
    (() => {
      const dir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      return path.join(dir, "eraya.db");
    })();

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      category_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      availability TEXT NOT NULL,
      stock_count INTEGER,
      is_new INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      bestseller_order INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      materials TEXT NOT NULL DEFAULT '[]',
      customisable INTEGER DEFAULT 1,
      tags TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
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
      sheets_last_synced_at TEXT,
      idempotency_key TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_sku TEXT NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      item_total INTEGER NOT NULL,
      customisation_details TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS custom_orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
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
      created_at TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      event TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'system',
      ip TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT ''
    );
  `);

  const orderCols = db.prepare("PRAGMA table_info(orders)").all() as { name: string }[];
  if (!orderCols.some((c) => c.name === "idempotency_key")) {
    db.exec("ALTER TABLE orders ADD COLUMN idempotency_key TEXT;");
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;");
  }

  const prodCols = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
  if (!prodCols.some((c) => c.name === "bestseller_order")) {
    db.exec("ALTER TABLE products ADD COLUMN bestseller_order INTEGER NOT NULL DEFAULT 0;");
  }

  const countRow = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
  const now = new Date().toISOString();
  if (countRow.c === 0) {
    const insert = db.prepare(`
      INSERT INTO products (
        id, slug, sku, name, category, category_name, price, availability, stock_count,
        is_new, is_featured, is_bestseller, is_demo, images, description, materials,
        customisable, tags, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of MOCK_PRODUCTS) {
      insert.run(
        p.id, p.slug, p.sku, p.name, p.category, p.categoryName, p.price, p.availability,
        p.stockCount ?? null, p.isNew ? 1 : 0, p.isFeatured ? 1 : 0, p.isBestseller ? 1 : 0,
        p.isDemo ? 1 : 0, JSON.stringify(p.images), p.description, JSON.stringify(p.materials),
        p.customisable ? 1 : 0, JSON.stringify(p.tags), p.order, now, now
      );
    }
  }

  const defaults: Record<string, string> = {
    upi_id: "eraya@upi",
    upi_name: "ERAYA Handmade",
    upi_qr_image: "",
    pickup_address:
      "Self-pickup location & timing will be confirmed via WhatsApp / Instagram DM after order review.",
    pickup_slots: JSON.stringify([
      "Weekday Evening",
      "Weekend Afternoon",
      "Flexible — contact me to schedule",
    ]),
    google_sheets_webhook_url: "",
    google_sheets_secret: "",
  };
  const upsertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(defaults)) upsertSetting.run(k, v);

  _sqliteDb = db;
  return db;
}

/* -------------------------------------------------------------------------- */
/*  Row Mappers                                                               */
/* -------------------------------------------------------------------------- */

function parseJsonArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    name: String(row.name),
    category: row.category as Product["category"],
    categoryName: String(row.category_name),
    price: Number(row.price),
    availability: row.availability as Product["availability"],
    stockCount: row.stock_count !== null && row.stock_count !== undefined ? Number(row.stock_count) : null,
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    bestsellerOrder: Number(row.bestseller_order ?? 0),
    isDemo: Boolean(row.is_demo),
    images: parseJsonArr(row.images),
    description: String(row.description),
    materials: parseJsonArr(row.materials),
    customisable: Boolean(row.customisable),
    tags: parseJsonArr(row.tags),
    order: Number(row.sort_order),
  };
}

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

function rowToOrder(row: Record<string, unknown>, items: OrderItemRecord[]): OrderRecord {
  return {
    id: String(row.id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    email: String(row.email || ""),
    pickupPreference: String(row.pickup_preference || ""),
    customerNotes: String(row.customer_notes || ""),
    paymentMethod: row.payment_method as PaymentMethod,
    upiReference: String(row.upi_reference || ""),
    paymentStatus: row.payment_status as PaymentStatus,
    orderStatus: row.order_status as OrderStatus,
    pickupStatus: row.pickup_status as PickupStatus,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    sheetsSyncStatus: row.sheets_sync_status as SheetsSyncStatus,
    sheetsSyncAttempts: Number(row.sheets_sync_attempts || 0),
    sheetsLastError: row.sheets_last_error ? String(row.sheets_last_error) : null,
    sheetsLastSyncedAt: row.sheets_last_synced_at ? iso(row.sheets_last_synced_at) : null,
    items,
  };
}

function rowToItem(r: Record<string, unknown>): OrderItemRecord {
  return {
    id: Number(r.id),
    orderId: String(r.order_id),
    productId: String(r.product_id),
    productSku: String(r.product_sku),
    productName: String(r.product_name),
    category: String(r.category),
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    itemTotal: Number(r.item_total),
    customisationDetails: String(r.customisation_details || ""),
  };
}

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

export async function listProducts(): Promise<Product[]> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM products ORDER BY sort_order DESC, created_at DESC");
    return rows.map(rowToProduct);
  }
  const db = getSqlite();
  const rows = db.prepare("SELECT * FROM products ORDER BY sort_order DESC, created_at DESC").all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM products WHERE slug = $1", [slug]);
    return rows[0] ? rowToProduct(rows[0]) : null;
  }
  const db = getSqlite();
  const row = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? rowToProduct(row) : null;
}

export async function getProductByIdDb(id: string): Promise<Product | null> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return rows[0] ? rowToProduct(rows[0]) : null;
  }
  const db = getSqlite();
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToProduct(row) : null;
}

export async function upsertProductDb(p: Product): Promise<Product> {
  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query(
      `INSERT INTO products (
        id, slug, sku, name, category, category_name, price, availability, stock_count,
        is_new, is_featured, is_bestseller, bestseller_order, is_demo, images, description, materials,
        customisable, tags, sort_order, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17::jsonb,$18,$19::jsonb,$20,NOW())
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug, sku = EXCLUDED.sku, name = EXCLUDED.name,
        category = EXCLUDED.category, category_name = EXCLUDED.category_name,
        price = EXCLUDED.price, availability = EXCLUDED.availability, stock_count = EXCLUDED.stock_count,
        is_new = EXCLUDED.is_new, is_featured = EXCLUDED.is_featured, is_bestseller = EXCLUDED.is_bestseller,
        bestseller_order = EXCLUDED.bestseller_order,
        is_demo = EXCLUDED.is_demo, images = EXCLUDED.images, description = EXCLUDED.description,
        materials = EXCLUDED.materials, customisable = EXCLUDED.customisable, tags = EXCLUDED.tags,
        sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
      [
        p.id, p.slug, p.sku, p.name, p.category, p.categoryName, p.price, p.availability,
        p.stockCount ?? null, Boolean(p.isNew), Boolean(p.isFeatured), Boolean(p.isBestseller),
        Number(p.bestsellerOrder ?? 0), Boolean(p.isDemo), JSON.stringify(p.images || []), p.description,
        JSON.stringify(p.materials || []), p.customisable !== false, JSON.stringify(p.tags || []), p.order ?? 0,
      ]
    );
    return (await getProductByIdDb(p.id))!;
  }

  const db = getSqlite();
  const now = new Date().toISOString();
  const existing = db.prepare("SELECT created_at FROM products WHERE id = ?").get(p.id) as { created_at: string } | undefined;
  const createdAt = existing?.created_at ?? now;
  db.prepare(`
    INSERT INTO products (
      id, slug, sku, name, category, category_name, price, availability, stock_count,
      is_new, is_featured, is_bestseller, bestseller_order, is_demo, images, description, materials,
      customisable, tags, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug, sku = excluded.sku, name = excluded.name,
      category = excluded.category, category_name = excluded.category_name,
      price = excluded.price, availability = excluded.availability, stock_count = excluded.stock_count,
      is_new = excluded.is_new, is_featured = excluded.is_featured, is_bestseller = excluded.is_bestseller,
      bestseller_order = excluded.bestseller_order,
      is_demo = excluded.is_demo, images = excluded.images, description = excluded.description,
      materials = excluded.materials, customisable = excluded.customisable, tags = excluded.tags,
      sort_order = excluded.sort_order, updated_at = excluded.updated_at
  `).run(
    p.id, p.slug, p.sku, p.name, p.category, p.categoryName, p.price, p.availability,
    p.stockCount ?? null, p.isNew ? 1 : 0, p.isFeatured ? 1 : 0, p.isBestseller ? 1 : 0,
    Number(p.bestsellerOrder ?? 0), p.isDemo ? 1 : 0, JSON.stringify(p.images || []), p.description,
    JSON.stringify(p.materials || []), p.customisable ? 1 : 0, JSON.stringify(p.tags || []), p.order ?? 0, createdAt, now
  );
  return (await getProductByIdDb(p.id))!;
}

export async function listBestsellersDb(): Promise<Product[]> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE is_bestseller = TRUE ORDER BY CASE WHEN bestseller_order > 0 THEN bestseller_order ELSE 999999 END ASC, sort_order DESC, created_at DESC"
    );
    return rows.map(rowToProduct);
  }
  const db = getSqlite();
  const rows = db
    .prepare(
      "SELECT * FROM products WHERE is_bestseller = 1 ORDER BY CASE WHEN bestseller_order > 0 THEN bestseller_order ELSE 999999 END ASC, sort_order DESC, created_at DESC"
    )
    .all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}

export async function saveBestsellersOrderDb(orderedIds: string[]): Promise<Product[]> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE products SET is_bestseller = FALSE, bestseller_order = 0");
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(
          "UPDATE products SET is_bestseller = TRUE, bestseller_order = $1, updated_at = NOW() WHERE id = $2",
          [i + 1, orderedIds[i]]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    return listBestsellersDb();
  }

  const db = getSqlite();
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE products SET is_bestseller = 0, bestseller_order = 0").run();
    const stmt = db.prepare(
      "UPDATE products SET is_bestseller = 1, bestseller_order = ?, updated_at = ? WHERE id = ?"
    );
    for (let i = 0; i < orderedIds.length; i++) {
      stmt.run(i + 1, now, orderedIds[i]);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return listBestsellersDb();
}

export async function deleteProductDb(id: string): Promise<boolean> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const res = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }
  const db = getSqlite();
  return db.prepare("DELETE FROM products WHERE id = ?").run(id).changes > 0;
}

/* -------------------------------------------------------------------------- */
/*  Settings                                                                  */
/* -------------------------------------------------------------------------- */

async function getAllSettingsMap(): Promise<Record<string, string>> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT key, value FROM settings");
    return Object.fromEntries(rows.map((r) => [String(r.key), String(r.value)]));
  }
  const db = getSqlite();
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getPublicSettings(): Promise<PublicOwnerSettings> {
  const m = await getAllSettingsMap();
  let slots: string[] = [];
  try {
    slots = JSON.parse(m.pickup_slots || "[]");
  } catch {
    slots = ["Flexible — contact me to schedule"];
  }
  return {
    upiId: m.upi_id || "",
    upiName: m.upi_name || "",
    upiQrImage: m.upi_qr_image || "",
    pickupAddress: m.pickup_address || "",
    pickupSlots: slots,
  };
}

export async function getAdminSettings(): Promise<AdminOwnerSettings> {
  const m = await getAllSettingsMap();
  const pub = await getPublicSettings();
  return {
    ...pub,
    googleSheetsWebhookUrl: m.google_sheets_webhook_url || process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
    googleSheetsSecret: m.google_sheets_secret || process.env.GOOGLE_SHEETS_SECRET || "",
  };
}

export async function updateAdminSettings(partial: Partial<AdminOwnerSettings>): Promise<AdminOwnerSettings> {
  const pairs: [string, string][] = [];
  if (partial.upiId !== undefined) pairs.push(["upi_id", partial.upiId.trim()]);
  if (partial.upiName !== undefined) pairs.push(["upi_name", partial.upiName.trim()]);
  if (partial.upiQrImage !== undefined) pairs.push(["upi_qr_image", partial.upiQrImage.trim()]);
  if (partial.pickupAddress !== undefined) pairs.push(["pickup_address", partial.pickupAddress.trim()]);
  if (partial.pickupSlots !== undefined) pairs.push(["pickup_slots", JSON.stringify(partial.pickupSlots)]);
  if (partial.googleSheetsWebhookUrl !== undefined) pairs.push(["google_sheets_webhook_url", partial.googleSheetsWebhookUrl.trim()]);
  if (partial.googleSheetsSecret !== undefined) pairs.push(["google_sheets_secret", partial.googleSheetsSecret.trim()]);

  if (usePostgres()) {
    const pool = await ensurePg();
    for (const [k, v] of pairs) {
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [k, v]
      );
    }
  } else {
    const db = getSqlite();
    const stmt = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    for (const [k, v] of pairs) stmt.run(k, v);
  }
  return getAdminSettings();
}

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */

function generateOrderId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ERY-${ymd}-${rand}`;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email?: string;
  pickupPreference: string;
  customerNotes?: string;
  paymentMethod: PaymentMethod;
  upiReference?: string;
  idempotencyKey?: string;
  items: { productId: string; quantity: number; customisationDetails?: string }[];
}

export async function getOrderByIdDb(id: string): Promise<OrderRecord | null> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (!rows[0]) return null;
    const { rows: itemRows } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
      [id]
    );
    return rowToOrder(rows[0], itemRows.map(rowToItem));
  }
  const db = getSqlite();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const itemRows = db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC").all(id) as Record<string, unknown>[];
  return rowToOrder(row, itemRows.map(rowToItem));
}

export async function createOrderDb(
  input: CreateOrderInput
): Promise<{ order: OrderRecord; duplicate: boolean }> {
  const id = generateOrderId();
  const paymentStatus: PaymentStatus =
    input.paymentMethod === "UPI" ? "PENDING_VERIFICATION" : "UNPAID";

  if (usePostgres()) {
    const pool = await ensurePg();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (input.idempotencyKey) {
        const { rows: existingRows } = await client.query(
          "SELECT id, phone FROM orders WHERE idempotency_key = $1",
          [input.idempotencyKey]
        );
        if (existingRows[0]) {
          if (String(existingRows[0].phone) !== input.phone.trim()) {
            throw new Error("Idempotency key conflict.");
          }
          await client.query("COMMIT");
          return { order: (await getOrderByIdDb(String(existingRows[0].id)))!, duplicate: true };
        }
      }

      const resolvedItems: Omit<OrderItemRecord, "id" | "orderId">[] = [];
      let subtotal = 0;

      for (const item of input.items) {
        // Row-level lock (FOR UPDATE) guarantees atomic stock verification in PostgreSQL
        const { rows: prodRows } = await client.query(
          "SELECT id, sku, name, category_name, price, availability, stock_count FROM products WHERE id = $1 FOR UPDATE",
          [item.productId]
        );
        const prod = prodRows[0];
        if (!prod) throw new Error(`Product not found: ${item.productId}`);

        const qty = Math.max(1, Math.min(20, Math.floor(item.quantity)));
        if (prod.availability === "available" && prod.stock_count !== null) {
          const stock = Number(prod.stock_count);
          if (stock < qty) {
            throw new Error(
              stock <= 0
                ? `"${prod.name}" is currently out of stock.`
                : `Only ${stock} left in stock for "${prod.name}".`
            );
          }
          await client.query(
            "UPDATE products SET stock_count = stock_count - $1, updated_at = NOW() WHERE id = $2",
            [qty, prod.id]
          );
        }

        const unitPrice = Number(prod.price);
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;
        resolvedItems.push({
          productId: String(prod.id),
          productSku: String(prod.sku),
          productName: String(prod.name),
          category: String(prod.category_name),
          quantity: qty,
          unitPrice,
          itemTotal,
          customisationDetails: (item.customisationDetails || "").trim().slice(0, 300),
        });
      }

      await client.query(
        `INSERT INTO orders (
          id, customer_name, phone, email, pickup_preference, customer_notes,
          payment_method, upi_reference, payment_status, order_status, pickup_status,
          subtotal, total, sheets_sync_status, sheets_sync_attempts, idempotency_key
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'RECEIVED','PENDING',$10,$11,'PENDING',0,$12)`,
        [
          id, input.customerName.trim(), input.phone.trim(), (input.email || "").trim(),
          input.pickupPreference.trim(), (input.customerNotes || "").trim(),
          input.paymentMethod, (input.upiReference || "").trim(), paymentStatus,
          subtotal, subtotal, input.idempotencyKey || null,
        ]
      );

      for (const it of resolvedItems) {
        await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_sku, product_name, category,
            quantity, unit_price, item_total, customisation_details
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, it.productId, it.productSku, it.productName, it.category, it.quantity, it.unitPrice, it.itemTotal, it.customisationDetails]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    return { order: (await getOrderByIdDb(id))!, duplicate: false };
  }

  // SQLite local dev path
  const db = getSqlite();
  const now = new Date().toISOString();
  const resolvedItems: Omit<OrderItemRecord, "id" | "orderId">[] = [];
  let subtotal = 0;

  db.exec("BEGIN IMMEDIATE");
  try {
    if (input.idempotencyKey) {
      const existing = db
        .prepare("SELECT id, phone FROM orders WHERE idempotency_key = ?")
        .get(input.idempotencyKey) as { id: string; phone: string } | undefined;
      if (existing) {
        if (existing.phone !== input.phone.trim()) {
          throw new Error("Idempotency key conflict.");
        }
        db.exec("COMMIT");
        return { order: (await getOrderByIdDb(existing.id))!, duplicate: true };
      }
    }

    for (const item of input.items) {
      const product = await getProductByIdDb(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const qty = Math.max(1, Math.min(20, Math.floor(item.quantity)));
      if (
        product.availability === "available" &&
        product.stockCount !== null &&
        product.stockCount !== undefined
      ) {
        if (product.stockCount < qty) {
          throw new Error(
            product.stockCount <= 0
              ? `"${product.name}" is currently out of stock.`
              : `Only ${product.stockCount} left in stock for "${product.name}".`
          );
        }
        db.prepare("UPDATE products SET stock_count = stock_count - ?, updated_at = ? WHERE id = ?").run(
          qty, now, product.id
        );
      }

      const unitPrice = product.price;
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;
      resolvedItems.push({
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        category: product.categoryName,
        quantity: qty,
        unitPrice,
        itemTotal,
        customisationDetails: (item.customisationDetails || "").trim().slice(0, 300),
      });
    }

    db.prepare(`
      INSERT INTO orders (
        id, created_at, updated_at, customer_name, phone, email,
        pickup_preference, customer_notes, payment_method, upi_reference,
        payment_status, order_status, pickup_status, subtotal, total,
        sheets_sync_status, sheets_sync_attempts, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', 'PENDING', ?, ?, 'PENDING', 0, ?)
    `).run(
      id, now, now, input.customerName.trim(), input.phone.trim(), (input.email || "").trim(),
      input.pickupPreference.trim(), (input.customerNotes || "").trim(), input.paymentMethod,
      (input.upiReference || "").trim(), paymentStatus, subtotal, subtotal, input.idempotencyKey || null
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_sku, product_name, category,
        quantity, unit_price, item_total, customisation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const it of resolvedItems) {
      insertItem.run(id, it.productId, it.productSku, it.productName, it.category, it.quantity, it.unitPrice, it.itemTotal, it.customisationDetails);
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  return { order: (await getOrderByIdDb(id))!, duplicate: false };
}

export async function listOrdersDb(): Promise<OrderRecord[]> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const { rows: allItems } = await pool.query("SELECT * FROM order_items ORDER BY id ASC");
    const byOrder = new Map<string, OrderItemRecord[]>();
    for (const r of allItems) {
      const it = rowToItem(r);
      const list = byOrder.get(it.orderId) ?? [];
      list.push(it);
      byOrder.set(it.orderId, list);
    }
    return rows.map((r) => rowToOrder(r, byOrder.get(String(r.id)) ?? []));
  }
  const db = getSqlite();
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as Record<string, unknown>[];
  return Promise.all(
    rows.map(async (r) => {
      const id = String(r.id);
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC").all(id) as Record<string, unknown>[];
      return rowToOrder(r, items.map(rowToItem));
    })
  );
}

export async function updateOrderStatusesDb(
  id: string,
  updates: { paymentStatus?: PaymentStatus; orderStatus?: OrderStatus; pickupStatus?: PickupStatus }
): Promise<OrderRecord | null> {
  const existing = await getOrderByIdDb(id);
  if (!existing) return null;

  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query(
      "UPDATE orders SET payment_status = $1, order_status = $2, pickup_status = $3, updated_at = NOW() WHERE id = $4",
      [
        updates.paymentStatus ?? existing.paymentStatus,
        updates.orderStatus ?? existing.orderStatus,
        updates.pickupStatus ?? existing.pickupStatus,
        id,
      ]
    );
    return getOrderByIdDb(id);
  }

  const db = getSqlite();
  db.prepare(
    "UPDATE orders SET payment_status = ?, order_status = ?, pickup_status = ?, updated_at = ? WHERE id = ?"
  ).run(
    updates.paymentStatus ?? existing.paymentStatus,
    updates.orderStatus ?? existing.orderStatus,
    updates.pickupStatus ?? existing.pickupStatus,
    new Date().toISOString(),
    id
  );
  return getOrderByIdDb(id);
}

export async function updateOrderSyncStateDb(
  id: string,
  state: {
    status: SheetsSyncStatus;
    attempts?: number;
    lastError?: string | null;
    lastSyncedAt?: string | null;
  }
) {
  const existing = await getOrderByIdDb(id);
  if (!existing) return;

  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query(
      "UPDATE orders SET sheets_sync_status = $1, sheets_sync_attempts = $2, sheets_last_error = $3, sheets_last_synced_at = $4 WHERE id = $5",
      [
        state.status,
        state.attempts ?? existing.sheetsSyncAttempts,
        state.lastError !== undefined ? state.lastError : existing.sheetsLastError,
        state.lastSyncedAt !== undefined ? state.lastSyncedAt : existing.sheetsLastSyncedAt,
        id,
      ]
    );
    return;
  }

  const db = getSqlite();
  db.prepare(
    "UPDATE orders SET sheets_sync_status = ?, sheets_sync_attempts = ?, sheets_last_error = ?, sheets_last_synced_at = ? WHERE id = ?"
  ).run(
    state.status,
    state.attempts ?? existing.sheetsSyncAttempts,
    state.lastError !== undefined ? state.lastError : existing.sheetsLastError,
    state.lastSyncedAt !== undefined ? state.lastSyncedAt : existing.sheetsLastSyncedAt,
    id
  );
}

/* -------------------------------------------------------------------------- */
/*  Custom Orders                                                             */
/* -------------------------------------------------------------------------- */

export async function createCustomOrderDb(input: {
  name: string;
  phone: string;
  category: string;
  request: string;
  budget?: string;
  referenceImageName?: string | null;
  referenceImageData?: string | null;
}): Promise<CustomOrderRecord> {
  const now = new Date().toISOString();
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const id = `CUST-${ymd}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query(
      `INSERT INTO custom_orders (
        id, name, phone, category, request, budget, reference_image_name, reference_image_data, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'NEW')`,
      [
        id, input.name.trim(), input.phone.trim(), input.category.trim(), input.request.trim(),
        (input.budget || "").trim(), input.referenceImageName ?? null, input.referenceImageData ?? null,
      ]
    );
  } else {
    const db = getSqlite();
    db.prepare(`
      INSERT INTO custom_orders (
        id, created_at, name, phone, category, request, budget, reference_image_name, reference_image_data, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
    `).run(
      id, now, input.name.trim(), input.phone.trim(), input.category.trim(), input.request.trim(),
      (input.budget || "").trim(), input.referenceImageName ?? null, input.referenceImageData ?? null
    );
  }

  return {
    id,
    createdAt: now,
    name: input.name.trim(),
    phone: input.phone.trim(),
    category: input.category.trim(),
    request: input.request.trim(),
    budget: (input.budget || "").trim(),
    referenceImageName: input.referenceImageName ?? null,
    referenceImageData: input.referenceImageData ?? null,
    status: "NEW",
  };
}

export async function listCustomOrdersDb(): Promise<CustomOrderRecord[]> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT * FROM custom_orders ORDER BY created_at DESC");
    return rows.map((r) => ({
      id: String(r.id),
      createdAt: iso(r.created_at),
      name: String(r.name),
      phone: String(r.phone),
      category: String(r.category),
      request: String(r.request),
      budget: String(r.budget || ""),
      referenceImageName: r.reference_image_name ? String(r.reference_image_name) : null,
      referenceImageData: r.reference_image_data ? String(r.reference_image_data) : null,
      status: r.status as CustomOrderRecord["status"],
    }));
  }
  const db = getSqlite();
  const rows = db.prepare("SELECT * FROM custom_orders ORDER BY created_at DESC").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: String(r.created_at),
    name: String(r.name),
    phone: String(r.phone),
    category: String(r.category),
    request: String(r.request),
    budget: String(r.budget || ""),
    referenceImageName: r.reference_image_name ? String(r.reference_image_name) : null,
    referenceImageData: r.reference_image_data ? String(r.reference_image_data) : null,
    status: r.status as CustomOrderRecord["status"],
  }));
}

export async function updateCustomOrderStatusDb(id: string, status: CustomOrderRecord["status"]) {
  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query("UPDATE custom_orders SET status = $1 WHERE id = $2", [status, id]);
    return;
  }
  const db = getSqlite();
  db.prepare("UPDATE custom_orders SET status = ? WHERE id = ?").run(status, id);
}

/* -------------------------------------------------------------------------- */
/*  Admin Sessions                                                            */
/* -------------------------------------------------------------------------- */

export async function createAdminSessionDb(id: string, expiresAt: number) {
  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query("DELETE FROM admin_sessions WHERE expires_at < $1 OR revoked = TRUE", [Date.now()]);
    await pool.query("INSERT INTO admin_sessions (id, expires_at, revoked) VALUES ($1, $2, FALSE)", [id, expiresAt]);
    return;
  }
  const db = getSqlite();
  db.prepare("DELETE FROM admin_sessions WHERE expires_at < ? OR revoked = 1").run(Date.now());
  db.prepare("INSERT INTO admin_sessions (id, created_at, expires_at, revoked) VALUES (?, ?, ?, 0)").run(
    id, new Date().toISOString(), expiresAt
  );
}

export async function isAdminSessionValidDb(id: string): Promise<boolean> {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT expires_at, revoked FROM admin_sessions WHERE id = $1", [id]);
    const row = rows[0];
    if (!row || row.revoked) return false;
    return Number(row.expires_at) > Date.now();
  }
  const db = getSqlite();
  const row = db.prepare("SELECT expires_at, revoked FROM admin_sessions WHERE id = ?").get(id) as
    | { expires_at: number; revoked: number }
    | undefined;
  if (!row || row.revoked) return false;
  return Number(row.expires_at) > Date.now();
}

export async function revokeAdminSessionDb(id: string) {
  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query("UPDATE admin_sessions SET revoked = TRUE WHERE id = $1", [id]);
    return;
  }
  const db = getSqlite();
  db.prepare("UPDATE admin_sessions SET revoked = 1 WHERE id = ?").run(id);
}

/* -------------------------------------------------------------------------- */
/*  Rate Limiting                                                             */
/* -------------------------------------------------------------------------- */

export async function checkRateLimitDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterSec: number }> {
  const now = Date.now();
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query("SELECT count, reset_at FROM rate_limits WHERE key = $1", [key]);
    const row = rows[0];
    if (!row || Number(row.reset_at) <= now) {
      const resetAt = now + windowMs;
      await pool.query(
        "INSERT INTO rate_limits (key, count, reset_at) VALUES ($1, 1, $2) ON CONFLICT (key) DO UPDATE SET count = 1, reset_at = EXCLUDED.reset_at",
        [key, resetAt]
      );
      return { allowed: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
    }
    const nextCount = Number(row.count) + 1;
    if (nextCount > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)),
      };
    }
    await pool.query("UPDATE rate_limits SET count = $1 WHERE key = $2", [nextCount, key]);
    return {
      allowed: true,
      remaining: Math.max(0, limit - nextCount),
      retryAfterSec: Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)),
    };
  }

  const db = getSqlite();
  const row = db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").get(key) as
    | { count: number; reset_at: number }
    | undefined;
  if (!row || Number(row.reset_at) <= now) {
    const resetAt = now + windowMs;
    db.prepare(
      "INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at"
    ).run(key, resetAt);
    return { allowed: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  const nextCount = Number(row.count) + 1;
  if (nextCount > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)),
    };
  }
  db.prepare("UPDATE rate_limits SET count = ? WHERE key = ?").run(nextCount, key);
  return {
    allowed: true,
    remaining: Math.max(0, limit - nextCount),
    retryAfterSec: Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)),
  };
}

export async function resetRateLimitDb(key: string) {
  if (usePostgres()) {
    const pool = await ensurePg();
    await pool.query("DELETE FROM rate_limits WHERE key = $1", [key]);
    return;
  }
  const db = getSqlite();
  db.prepare("DELETE FROM rate_limits WHERE key = ?").run(key);
}

/* -------------------------------------------------------------------------- */
/*  Security Logs                                                             */
/* -------------------------------------------------------------------------- */

export async function logSecurityEventDb(event: string, actor: string, ip: string, details = "") {
  try {
    if (usePostgres()) {
      const pool = await ensurePg();
      await pool.query(
        "INSERT INTO security_logs (event, actor, ip, details) VALUES ($1, $2, $3, $4)",
        [event, actor, ip, details.slice(0, 300)]
      );
      return;
    }
    const db = getSqlite();
    db.prepare(
      "INSERT INTO security_logs (created_at, event, actor, ip, details) VALUES (?, ?, ?, ?, ?)"
    ).run(new Date().toISOString(), event, actor, ip, details.slice(0, 300));
  } catch {
    // Never crash caller on logging failure
  }
}

export async function listSecurityLogsDb(limit = 50) {
  if (usePostgres()) {
    const pool = await ensurePg();
    const { rows } = await pool.query(
      "SELECT id, created_at, event, actor, ip, details FROM security_logs ORDER BY id DESC LIMIT $1",
      [limit]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      created_at: iso(r.created_at),
      event: String(r.event),
      actor: String(r.actor),
      ip: String(r.ip),
      details: String(r.details),
    }));
  }
  const db = getSqlite();
  return db
    .prepare("SELECT id, created_at, event, actor, ip, details FROM security_logs ORDER BY id DESC LIMIT ?")
    .all(limit) as {
    id: number;
    created_at: string;
    event: string;
    actor: string;
    ip: string;
    details: string;
  }[];
}

/* -------------------------------------------------------------------------- */
/*  Backup Snapshot Export (non-sensitive operational backup)                 */
/* -------------------------------------------------------------------------- */

export async function exportDatabaseSnapshot() {
  const [products, orders, customOrders, settings] = await Promise.all([
    listProducts(),
    listOrdersDb(),
    listCustomOrdersDb(),
    getPublicSettings(),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    driver: usePostgres() ? "postgres" : "sqlite",
    products,
    orders,
    customOrders,
    publicSettings: settings,
  };
}
