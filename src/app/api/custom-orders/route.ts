import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitDb, createCustomOrderDb, logSecurityEventDb } from "@/lib/db";
import {
  getClientIp,
  sanitizeFilename,
  validateBase64Image,
  verifySameOrigin,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const len = Number(req.headers.get("content-length") || 0);
  if (len > 6 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 413 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimitDb(`custom_order:${ip}`, 6, 15 * 60 * 1000);
  if (!rl.allowed) {
    await logSecurityEventDb("CUSTOM_ORDER_RATE_LIMITED", "customer", ip, "Custom order rate limit exceeded");
    return NextResponse.json(
      { ok: false, error: "Too many enquiries submitted. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 120);
    const phone = String(body.phone || "").trim();
    const category = String(body.category || "").trim().slice(0, 60);
    const request = String(body.request || "").trim().slice(0, 1500);
    const budget = String(body.budget || "").trim().slice(0, 20);
    const rawName = body.referenceImageName ? sanitizeFilename(String(body.referenceImageName)) : null;
    const rawData = body.referenceImageData ? String(body.referenceImageData) : null;

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    }
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+?91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return NextResponse.json({ ok: false, error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ ok: false, error: "Choose a product category." }, { status: 400 });
    }
    if (request.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Please describe your custom request (at least 10 characters)." },
        { status: 400 }
      );
    }
    if (budget && (!/^\d+$/.test(budget) || Number(budget) < 1)) {
      return NextResponse.json({ ok: false, error: "Budget must be a positive number." }, { status: 400 });
    }

    if (rawData) {
      const imgCheck = validateBase64Image(rawData, 4 * 1024 * 1024);
      if (!imgCheck.ok) {
        await logSecurityEventDb("UPLOAD_REJECTED", "customer", ip, imgCheck.error);
        return NextResponse.json({ ok: false, error: imgCheck.error }, { status: 400 });
      }
    }

    const record = await createCustomOrderDb({
      name,
      phone: digits,
      category,
      request,
      budget,
      referenceImageName: rawData ? rawName : null,
      referenceImageData: rawData,
    });

    return NextResponse.json({ ok: true, id: record.id, createdAt: record.createdAt }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save enquiry." }, { status: 400 });
  }
}
