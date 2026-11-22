import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/auth";
import {
  checkRateLimitDb,
  logSecurityEventDb,
  resetRateLimitDb,
} from "@/lib/db";
import { getClientIp, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(req);

  if (!isAdminConfigured()) {
    await logSecurityEventDb("ADMIN_LOGIN_MISCONFIGURED", "system", ip, "ADMIN_PASSWORD or ADMIN_SESSION_SECRET missing/weak");
    return NextResponse.json(
      { ok: false, error: "Admin authentication is not configured on the server." },
      { status: 503 }
    );
  }

  const rl = await checkRateLimitDb(`admin_login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    await logSecurityEventDb("ADMIN_LOGIN_RATE_LIMITED", "anonymous", ip, "Too many failed login attempts");
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !verifyAdminPassword(password)) {
      await logSecurityEventDb("ADMIN_LOGIN_FAILED", "anonymous", ip, "Invalid password");
      return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
    }

    await resetRateLimitDb(`admin_login:${ip}`);
    const token = await createAdminToken();
    await logSecurityEventDb("ADMIN_LOGIN_SUCCESS", "admin", ip, "Session issued");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
