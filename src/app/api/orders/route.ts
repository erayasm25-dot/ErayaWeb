import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitDb,
  createOrderDb,
  getOrderByIdDb,
  logSecurityEventDb,
} from "@/lib/db";
import { syncOrderToGoogleSheets } from "@/lib/sheets-sync";
import { getClientIp, PAYMENT_METHODS, verifySameOrigin } from "@/lib/security";
import { PaymentMethod } from "@/types/order";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const len = Number(req.headers.get("content-length") || 0);
  if (len > 64 * 1024) {
    return NextResponse.json({ ok: false, error: "Request payload too large." }, { status: 413 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimitDb(`order_create:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    await logSecurityEventDb("ORDER_RATE_LIMITED", "customer", ip, "Order endpoint rate limit exceeded");
    return NextResponse.json(
      { ok: false, error: "Too many order attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const customerName = String(body.customerName || "").trim().slice(0, 120);
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().slice(0, 160);
    const pickupPreference = String(body.pickupPreference || "").trim().slice(0, 120);
    const customerNotes = String(body.customerNotes || "").trim().slice(0, 500);
    const paymentMethod = body.paymentMethod as PaymentMethod;
    const upiReference = String(body.upiReference || "").trim().slice(0, 40);
    const idempotencyKey =
      typeof body.idempotencyKey === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(body.idempotencyKey)
        ? body.idempotencyKey
        : undefined;
    const items = Array.isArray(body.items) ? body.items : [];

    if (customerName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your full name." }, { status: 400 });
    }
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+?91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!pickupPreference) {
      return NextResponse.json({ ok: false, error: "Please select a pickup preference." }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ ok: false, error: "Please select a valid payment method." }, { status: 400 });
    }
    if (paymentMethod === "UPI" && !/^[A-Za-z0-9\-_]{6,40}$/.test(upiReference)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please enter a valid UPI transaction reference / UTR (6–40 letters or digits).",
        },
        { status: 400 }
      );
    }
    if (items.length === 0 || items.length > 25) {
      return NextResponse.json({ ok: false, error: "Your cart is invalid or empty." }, { status: 400 });
    }

    for (const it of items) {
      const qty = Number(it?.quantity);
      if (!it?.productId || !Number.isInteger(qty) || qty < 1 || qty > 20) {
        return NextResponse.json(
          { ok: false, error: "Each item quantity must be between 1 and 20." },
          { status: 400 }
        );
      }
    }

    // 1. Save permanently in DB first (transactional, authoritative pricing & stock)
    const { order, duplicate } = await createOrderDb({
      customerName,
      phone: digits,
      email,
      pickupPreference,
      customerNotes,
      paymentMethod,
      upiReference: paymentMethod === "UPI" ? upiReference : "",
      idempotencyKey,
      items: items.map((i: { productId: string; quantity: number; customisationDetails?: string }) => ({
        productId: String(i.productId),
        quantity: Number(i.quantity),
        customisationDetails: String(i.customisationDetails || ""),
      })),
    });

    if (!duplicate) {
      await syncOrderToGoogleSheets(order.id, true).catch(() => {});
    }

    const fresh = (await getOrderByIdDb(order.id)) ?? order;

    // Return only customer-facing order confirmation fields (no internal sync errors)
    return NextResponse.json(
      {
        ok: true,
        order: {
          id: fresh.id,
          createdAt: fresh.createdAt,
          customerName: fresh.customerName,
          phone: fresh.phone,
          pickupPreference: fresh.pickupPreference,
          paymentMethod: fresh.paymentMethod,
          upiReference: fresh.upiReference,
          paymentStatus: fresh.paymentStatus,
          orderStatus: fresh.orderStatus,
          pickupStatus: fresh.pickupStatus,
          subtotal: fresh.subtotal,
          total: fresh.total,
          items: fresh.items,
        },
      },
      { status: duplicate ? 200 : 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not place order";
    const status = msg.includes("stock") ? 409 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
