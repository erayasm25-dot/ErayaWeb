import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { retryAllPendingSyncs } from "@/lib/sheets-sync";
import { verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const results = await retryAllPendingSyncs();
  return NextResponse.json({ ok: true, results });
}
