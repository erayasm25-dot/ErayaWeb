import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listSecurityLogsDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, logs: await listSecurityLogsDb(50) });
}
