import { NextResponse } from "next/server";
import { listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json({ ok: true, products });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to load products" },
      { status: 500 }
    );
  }
}
