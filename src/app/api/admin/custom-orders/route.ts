import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listCustomOrdersDb, updateCustomOrderStatusDb } from "@/lib/db";
import { CUSTOM_ORDER_STATUSES, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, customOrders: await listCustomOrdersDb() });
}

export async function PATCH(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id || !CUSTOM_ORDER_STATUSES.includes(body.status)) {
    return NextResponse.json({ ok: false, error: "Invalid id or status" }, { status: 400 });
  }
  await updateCustomOrderStatusDb(String(body.id), body.status);
  return NextResponse.json({ ok: true });
}
