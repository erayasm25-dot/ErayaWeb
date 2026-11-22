/**
 * ERAYA Database Backup Script (PostgreSQL via DATABASE_URL or local SQLite)
 * Usage: node scripts/backup-db.mjs [output-dir]
 */
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { DatabaseSync } from "node:sqlite";

const outDir = path.resolve(process.argv[2] || path.join(process.cwd(), "backups"));
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = path.join(outDir, `eraya-backup-${stamp}.json`);

async function run() {
  let snapshot;
  if (process.env.DATABASE_URL?.trim()) {
    const connStr = process.env.DATABASE_URL.trim();
    const isLocal = connStr.includes("localhost") || connStr.includes("127.0.0.1");
    const pool = new Pool({
      connectionString: connStr,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
    try {
      const [products, orders, orderItems, customOrders, settings] = await Promise.all([
        pool.query("SELECT * FROM products"),
        pool.query("SELECT * FROM orders"),
        pool.query("SELECT * FROM order_items"),
        pool.query("SELECT * FROM custom_orders"),
        pool.query("SELECT * FROM settings"),
      ]);
      snapshot = {
        exportedAt: new Date().toISOString(),
        driver: "postgres",
        products: products.rows,
        orders: orders.rows,
        orderItems: orderItems.rows,
        customOrders: customOrders.rows,
        settings: settings.rows,
      };
    } finally {
      await pool.end();
    }
  } else {
    const dbPath = process.env.ERAYA_DB_PATH || path.join(process.cwd(), "data", "eraya.db");
    const db = new DatabaseSync(dbPath);
    snapshot = {
      exportedAt: new Date().toISOString(),
      driver: "sqlite",
      products: db.prepare("SELECT * FROM products").all(),
      orders: db.prepare("SELECT * FROM orders").all(),
      orderItems: db.prepare("SELECT * FROM order_items").all(),
      customOrders: db.prepare("SELECT * FROM custom_orders").all(),
      settings: db.prepare("SELECT * FROM settings").all(),
    };
    db.close();
  }

  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`Backup written to ${outFile} (${snapshot.orders.length} orders, ${snapshot.products.length} products)`);
}

run().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
