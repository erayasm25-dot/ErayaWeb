import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to load settings" },
      { status: 500 }
    );
  }
}
