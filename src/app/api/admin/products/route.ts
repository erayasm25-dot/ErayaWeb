import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listProducts, upsertProductDb, deleteProductDb, logSecurityEventDb } from "@/lib/db";
import { getCategory } from "@/data/categories";
import { getClientIp, verifySameOrigin } from "@/lib/security";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, products: await listProducts() });
}

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cat = getCategory(body.category);
    if (!cat) {
      return NextResponse.json({ ok: false, error: "Invalid category" }, { status: 400 });
    }
    const name = String(body.name || "").trim().slice(0, 140);
    if (!name) {
      return NextResponse.json({ ok: false, error: "Product name is required" }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 1 || price > 500000) {
      return NextResponse.json({ ok: false, error: "Price must be between ₹1 and ₹5,00,000" }, { status: 400 });
    }

    const slug =
      String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const id = String(body.id || slug).replace(/[^a-zA-Z0-9_-]/g, "");

    // Allow only relative /images/... or https:// image URLs (reject javascript: or data: HTML)
    const rawImages = Array.isArray(body.images) ? body.images : [];
    const safeImages = rawImages
      .map((u: unknown) => String(u || "").trim())
      .filter((u: string) => u.startsWith("/images/") || u.startsWith("https://"));

    const product: Product = {
      id,
      slug,
      sku: String(body.sku || `ERY-${Date.now().toString().slice(-4)}`).trim().toUpperCase().slice(0, 32),
      name,
      category: cat.id,
      categoryName: cat.name,
      price: Math.round(price),
      availability: body.availability === "made-to-order" ? "made-to-order" : "available",
      stockCount:
        body.stockCount !== undefined && body.stockCount !== null && body.stockCount !== ""
          ? Math.max(0, Math.min(9999, Math.floor(Number(body.stockCount))))
          : null,
      isNew: Boolean(body.isNew),
      isFeatured: Boolean(body.isFeatured),
      isBestseller: Boolean(body.isBestseller),
      isDemo: Boolean(body.isDemo),
      images: safeImages,
      description: String(body.description || "").trim().slice(0, 2000),
      materials: Array.isArray(body.materials)
        ? body.materials.map((m: unknown) => String(m).trim().slice(0, 80)).filter(Boolean)
        : [],
      customisable: body.customisable !== false,
      tags: Array.isArray(body.tags)
        ? body.tags.map((t: unknown) => String(t).trim().slice(0, 40)).filter(Boolean)
        : [cat.name.toLowerCase()],
      order: Number(body.order || 50),
    };

    const saved = await upsertProductDb(product);
    await logSecurityEventDb("ADMIN_PRODUCT_SAVED", "admin", getClientIp(req), `Product ${saved.id} (${saved.sku})`);
    return NextResponse.json({ ok: true, product: saved });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save product" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") || "");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing product id" }, { status: 400 });
  }
  const deleted = await deleteProductDb(id);
  if (deleted) {
    await logSecurityEventDb("ADMIN_PRODUCT_DELETED", "admin", getClientIp(req), `Product ${id}`);
  }
  return NextResponse.json({ ok: deleted });
}
