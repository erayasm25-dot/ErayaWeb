import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  listBestsellersDb,
  saveBestsellersOrderDb,
  logSecurityEventDb,
} from "@/lib/db";
import { getClientIp, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const bestsellers = await listBestsellersDb();
  return NextResponse.json({ ok: true, bestsellers });
}

export async function PUT(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body.orderedIds)) {
      return NextResponse.json(
        { ok: false, error: "orderedIds array is required" },
        { status: 400 }
      );
    }
    const orderedIds = Array.from(
      new Set(body.orderedIds.map((id: unknown) => String(id || "").trim()).filter(Boolean))
    ) as string[];

    const bestsellers = await saveBestsellersOrderDb(orderedIds);
    await logSecurityEventDb(
      "ADMIN_BESTSELLERS_UPDATED",
      "admin",
      getClientIp(req),
      `Updated ${bestsellers.length} bestseller(s)`
    );
    return NextResponse.json({ ok: true, bestsellers });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update bestsellers" },
      { status: 400 }
    );
  }
}
