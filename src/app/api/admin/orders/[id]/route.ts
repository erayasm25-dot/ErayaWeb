import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateOrderStatusesDb, getOrderByIdDb, logSecurityEventDb } from "@/lib/db";
import { syncOrderToGoogleSheets } from "@/lib/sheets-sync";
import {
  getClientIp,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PICKUP_STATUSES,
  verifySameOrigin,
} from "@/lib/security";
import { OrderStatus, PaymentStatus, PickupStatus } from "@/types/order";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const updates: {
      paymentStatus?: PaymentStatus;
      orderStatus?: OrderStatus;
      pickupStatus?: PickupStatus;
    } = {};

    if (body.paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
        return NextResponse.json({ ok: false, error: "Invalid payment status" }, { status: 400 });
      }
      updates.paymentStatus = body.paymentStatus;
    }
    if (body.orderStatus !== undefined) {
      if (!ORDER_STATUSES.includes(body.orderStatus)) {
        return NextResponse.json({ ok: false, error: "Invalid order status" }, { status: 400 });
      }
      updates.orderStatus = body.orderStatus;
    }
    if (body.pickupStatus !== undefined) {
      if (!PICKUP_STATUSES.includes(body.pickupStatus)) {
        return NextResponse.json({ ok: false, error: "Invalid pickup status" }, { status: 400 });
      }
      updates.pickupStatus = body.pickupStatus;
    }

    const updated = await updateOrderStatusesDb(id, updates);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    await logSecurityEventDb(
      updates.paymentStatus ? "ADMIN_PAYMENT_VERIFICATION" : "ADMIN_ORDER_UPDATED",
      "admin",
      getClientIp(req),
      `Order ${updated.id}: ${JSON.stringify(updates)}`
    );

    await syncOrderToGoogleSheets(updated.id, true).catch(() => {});
    const fresh = (await getOrderByIdDb(updated.id)) ?? updated;

    return NextResponse.json({ ok: true, order: fresh });
  } catch {
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 400 });
  }
}
