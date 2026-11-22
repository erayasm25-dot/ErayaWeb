import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  createAdminSessionDb,
  isAdminSessionValidDb,
  revokeAdminSessionDb,
} from "@/lib/db";

export const ADMIN_COOKIE = "eraya_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const DISALLOWED_PROD_PASSWORDS = new Set([
  "eraya-admin-2026",
  "admin",
  "admin123",
  "password",
  "12345678",
  "changeme",
  "change-this-admin-password",
  "change-this-strong-admin-password",
]);

function getSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  const minLen = process.env.NODE_ENV === "production" ? 32 : 16;
  if (!s || s.length < minLen) return null;
  if (
    process.env.NODE_ENV === "production" &&
    s.includes("eraya-local-dev-session-secret")
  ) {
    return null;
  }
  return s;
}

export function isAdminConfigured(): boolean {
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (!pw) return false;
  if (process.env.NODE_ENV === "production") {
    if (pw.length < 12 || DISALLOWED_PROD_PASSWORDS.has(pw.toLowerCase())) {
      return false;
    }
  } else if (pw.length < 8) {
    return false;
  }
  return Boolean(getSecret());
}

export function verifyAdminPassword(password: string): boolean {
  if (!isAdminConfigured()) return false;
  const expected = process.env.ADMIN_PASSWORD!.trim();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export async function createAdminToken(): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  const jti = crypto.randomBytes(16).toString("hex");
  const exp = Date.now() + SESSION_TTL_MS;
  await createAdminSessionDb(jti, exp);
  const payload = `admin.${jti}.${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function parseAndVerifyAdminToken(
  token: string | undefined
): Promise<{ valid: true; jti: string } | { valid: false }> {
  if (!token) return { valid: false };
  const secret = getSecret();
  if (!secret) return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 4) return { valid: false };
  const [role, jti, expStr, sig] = parts;
  if (role !== "admin" || !/^[a-f0-9]{32}$/.test(jti)) return { valid: false };
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return { valid: false };

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${role}.${jti}.${expStr}`)
    .digest("hex");

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false };
  }

  if (!(await isAdminSessionValidDb(jti))) {
    return { valid: false };
  }

  return { valid: true, jti };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const parsed = await parseAndVerifyAdminToken(token);
  return parsed.valid;
}

export async function revokeCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const parsed = await parseAndVerifyAdminToken(token);
  if (parsed.valid) {
    await revokeAdminSessionDb(parsed.jti);
  }
}
