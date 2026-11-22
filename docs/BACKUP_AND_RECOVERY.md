# ERAYA Database Backup & Recovery Guide

## 1. Production Database Architecture
ERAYA uses **PostgreSQL** (`DATABASE_URL`) in production (`migrations/001_initial_postgres.sql`).
Local development falls back to SQLite (`data/eraya.db`) only when `DATABASE_URL` is unset and `NODE_ENV !== "production"`.

## 2. How Backups Are Created & Stored
1. **Managed PostgreSQL Backups (Render / Supabase / Neon):**
   - Render PostgreSQL provides automated daily logical backups (stored in encrypted provider object storage; retention depends on plan).
   - **Action for Owner:** Enable automatic daily backups in your PostgreSQL provider dashboard and store exported backups in a private Google Drive folder or encrypted local drive (never in GitHub).
2. **Manual / Scheduled JSON Snapshot (`scripts/backup-db.mjs` or `/admin`):**
   - **From Owner Dashboard:** Sign in at `/admin` → **Owner Settings** → click **Download Database Backup (JSON)** (`GET /api/admin/backup`).
   - **From CLI / Cron:** Run `node scripts/backup-db.mjs` (writes timestamped JSON to `eraya/backups/`, gitignored). Recommended frequency: daily or after every batch of orders.
3. **Operational Mirror (Google Sheets):**
   - Every new order and status update is automatically synced to the `ERAYA ORDERS` and `ORDER ITEMS` tabs. Note that Google Sheets is an operational mirror and does **not** back up `admin_sessions`, `rate_limits`, `security_logs`, or custom-order reference images.

## 3. Recovery Procedure
1. Provision or connect the target PostgreSQL database (`DATABASE_URL`).
2. Start the Next.js app (or apply `migrations/001_initial_postgres.sql` with `psql "$DATABASE_URL" -f migrations/001_initial_postgres.sql`).
3. Restore orders & products non-destructively from a JSON snapshot:
   ```bash
   DATABASE_URL="postgres://..." node scripts/restore-db.mjs backups/eraya-backup-YYYY-MM-DD.json
   ```
4. For full Render `pg_dump` snapshots:
   ```bash
   pg_restore --clean --if-exists --dbname="$DATABASE_URL" dump.sql
   ```
