import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, revokeCurrentAdminSession } from "@/lib/auth";
import { logSecurityEventDb } from "@/lib/db";
import { getClientIp, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  await revokeCurrentAdminSession();
  await logSecurityEventDb("ADMIN_LOGOUT", "admin", getClientIp(req), "Session revoked");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
