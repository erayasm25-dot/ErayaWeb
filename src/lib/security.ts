import { NextRequest } from "next/server";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PickupStatus,
} from "@/types/order";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "UNPAID",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "RECEIVED",
  "CRAFTING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
];

export const PICKUP_STATUSES: PickupStatus[] = [
  "PENDING",
  "READY",
  "PICKED_UP",
];

export const CUSTOM_ORDER_STATUSES = ["NEW", "REVIEWING", "QUOTED", "CLOSED"] as const;

export const PAYMENT_METHODS: PaymentMethod[] = ["UPI", "PAY_AT_PICKUP"];

/**
 * Extract client IP for rate limiting & security logging.
 * Uses the rightmost x-forwarded-for hop (appended by the trusted reverse proxy)
 * or x-real-ip so clients cannot spoof rate limits by prepending fake IPs.
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last.slice(0, 64);
  }
  return "local";
}

/**
 * Verify that state-changing requests come from the same origin/host.
 * Checks Origin first, then Referer (for legacy browsers), then Sec-Fetch-Site.
 */
export function verifySameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  if (origin) {
    if (!host) return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    if (!host) return false;
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  const fetchSite = req.headers.get("sec-fetch-site");
  return fetchSite !== "cross-site";
}

/**
 * Prevent CSV / Google Sheets formula injection by neutralizing values that
 * begin (even after leading whitespace) with =, +, -, @, tab, or carriage return.
 */
export function sanitizeSheetCell(value: unknown): string {
  const str = String(value ?? "").replace(/\r\n/g, " ").replace(/[\r\n]/g, " ");
  if (/^\s*[=+\-@\t]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/** Sanitize uploaded filenames (strip path separators & unsafe chars). */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "upload";
}

/**
 * Validate a base64 data-URL image strictly by MIME allow-list AND magic bytes.
 * Rejects SVG, HTML, scripts, and oversized payloads.
 */
export function validateBase64Image(
  dataUrl: string,
  maxBytes = 4 * 1024 * 1024
): { ok: true; mime: string } | { ok: false; error: string } {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
    dataUrl.trim()
  );
  if (!match) {
    return { ok: false, error: "Only PNG, JPEG, or WebP images are permitted." };
  }
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, "base64");
  if (buf.length === 0 || buf.length > maxBytes) {
    return { ok: false, error: `Image must be under ${Math.round(maxBytes / (1024 * 1024))} MB.` };
  }

  const isPng =
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47;
  const isJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp =
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP";

  if ((mime === "image/png" && !isPng) || ((mime === "image/jpeg" || mime === "image/jpg") && !isJpeg) || (mime === "image/webp" && !isWebp)) {
    return { ok: false, error: "Image file signature does not match its declared format." };
  }

  return { ok: true, mime };
}

/** Mask a customer's name for public tracking responses (e.g. "Ananya Sharma" -> "A*** S***"). */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part.length <= 1 ? "*" : `${part[0]}${"*".repeat(Math.min(3, part.length - 1))}`))
    .join(" ");
}

/** Mask a UPI reference, keeping only the last 4 characters. */
export function maskRef(ref: string): string {
  const clean = ref.trim();
  if (!clean) return "";
  if (clean.length <= 4) return "••••";
  return `••••${clean.slice(-4)}`;
}
