import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { exportDatabaseSnapshot, logSecurityEventDb } from "@/lib/db";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await exportDatabaseSnapshot();
  await logSecurityEventDb("ADMIN_BACKUP_EXPORT", "admin", getClientIp(req), `Driver: ${snapshot.driver}`);
  const filename = `eraya-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
