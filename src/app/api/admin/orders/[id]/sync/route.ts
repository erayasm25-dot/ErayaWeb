import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrderByIdDb, logSecurityEventDb } from "@/lib/db";
import { syncOrderToGoogleSheets } from "@/lib/sheets-sync";
import { getClientIp, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await syncOrderToGoogleSheets(id, false);
  const order = await getOrderByIdDb(id);
  await logSecurityEventDb("ADMIN_MANUAL_SYNC", "admin", getClientIp(req), `Order ${id}: ${result.status}`);
  return NextResponse.json({ ok: result.ok, result, order });
}
