import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitDb, getOrderByIdDb, logSecurityEventDb } from "@/lib/db";
import { getClientIp, maskName, maskRef } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimitDb(`order_track:${ip}`, 15, 15 * 60 * 1000);
  if (!rl.allowed) {
    await logSecurityEventDb("TRACK_RATE_LIMITED", "customer", ip, "Order tracking rate limit exceeded");
    return NextResponse.json(
      { ok: false, error: "Too many tracking requests. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const orderId = String(searchParams.get("orderId") || "").trim().toUpperCase();
  const phone = String(searchParams.get("phone") || "")
    .replace(/[\s\-()]/g, "")
    .replace(/^\+?91/, "");

  if (!/^ERY-\d{8}-[A-F0-9]{4}$/.test(orderId) || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "No matching order found. Please check your Order ID and 10-digit mobile number." },
      { status: 404 }
    );
  }

  const order = await getOrderByIdDb(orderId);
  if (!order || order.phone !== phone) {
    return NextResponse.json(
      { ok: false, error: "No matching order found. Please check your Order ID and 10-digit mobile number." },
      { status: 404 }
    );
  }

  // Return minimal, privacy-safe tracking response (mask name & UPI ref, omit email/phone/notes)
  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerName: maskName(order.customerName),
      pickupPreference: order.pickupPreference,
      paymentMethod: order.paymentMethod,
      upiReference: maskRef(order.upiReference),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      pickupStatus: order.pickupStatus,
      subtotal: order.subtotal,
      total: order.total,
      items: order.items,
    },
  });
}
