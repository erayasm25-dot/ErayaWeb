import {
  getAdminSettings,
  getOrderByIdDb,
  listOrdersDb,
  updateOrderSyncStateDb,
  logSecurityEventDb,
} from "@/lib/db";
import { sanitizeSheetCell } from "@/lib/security";
import { OrderRecord } from "@/types/order";

function buildPayload(order: OrderRecord, secret: string) {
  const productNames = order.items.map((i) => `${i.productName} (×${i.quantity})`).join("; ");
  const productSkus = order.items.map((i) => i.productSku).join(", ");
  const categories = Array.from(new Set(order.items.map((i) => i.category))).join(", ");
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const unitPrices = order.items.map((i) => i.unitPrice).join(", ");
  const customDetails = order.items
    .map((i) => (i.customisationDetails ? `${i.productName}: ${i.customisationDetails}` : ""))
    .filter(Boolean)
    .join(" | ");

  return {
    secret,
    action: "upsert_order",
    order: {
      orderId: sanitizeSheetCell(order.id),
      orderDate: order.createdAt,
      customerName: sanitizeSheetCell(order.customerName),
      phoneNumber: sanitizeSheetCell(order.phone),
      email: sanitizeSheetCell(order.email),
      productName: sanitizeSheetCell(productNames),
      productSku: sanitizeSheetCell(productSkus),
      category: sanitizeSheetCell(categories),
      quantity: totalQty,
      unitPrice: order.items.length === 1 ? order.items[0].unitPrice : sanitizeSheetCell(unitPrices),
      itemTotal: order.subtotal,
      orderTotal: order.total,
      customisationDetails: sanitizeSheetCell(customDetails),
      paymentMethod: sanitizeSheetCell(order.paymentMethod),
      upiTransactionReference: sanitizeSheetCell(order.upiReference),
      paymentStatus: sanitizeSheetCell(order.paymentStatus),
      orderStatus: sanitizeSheetCell(order.orderStatus),
      pickupStatus: sanitizeSheetCell(order.pickupStatus),
      customerNotes: sanitizeSheetCell(
        [order.pickupPreference ? `Pickup: ${order.pickupPreference}` : "", order.customerNotes]
          .filter(Boolean)
          .join(" | ")
      ),
      googleSheetsSyncStatus: "SYNCED",
    },
    items: order.items.map((it) => ({
      orderId: sanitizeSheetCell(order.id),
      productSku: sanitizeSheetCell(it.productSku),
      productName: sanitizeSheetCell(it.productName),
      category: sanitizeSheetCell(it.category),
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      itemTotal: it.itemTotal,
      customisationDetails: sanitizeSheetCell(it.customisationDetails),
    })),
  };
}

/**
 * Synchronizes a single order to Google Sheets (idempotent by Order ID).
 * Never throws; records status & error in SQLite and schedules background retry
 * if a transient failure occurs.
 */
export async function syncOrderToGoogleSheets(
  orderId: string,
  scheduleRetry = true
): Promise<{ ok: boolean; status: string; error?: string }> {
  const order = await getOrderByIdDb(orderId);
  if (!order) return { ok: false, status: "FAILED", error: "Order not found" };

  const settings = await getAdminSettings();
  const webhookUrl = settings.googleSheetsWebhookUrl;

  if (!webhookUrl) {
    await updateOrderSyncStateDb(orderId, {
      status: "NOT_CONFIGURED",
      lastError: "Google Sheets webhook URL is not configured in Owner Settings.",
    });
    return {
      ok: false,
      status: "NOT_CONFIGURED",
      error: "Google Sheets webhook URL not configured",
    };
  }

  const attempts = order.sheetsSyncAttempts + 1;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(order, settings.googleSheetsSecret)),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json().catch(() => ({ ok: true }))) as {
      ok?: boolean;
      error?: string;
    };
    if (data.ok === false) {
      throw new Error(data.error || "Apps Script returned error");
    }

    const syncedAt = new Date().toISOString();
    await updateOrderSyncStateDb(orderId, {
      status: "SYNCED",
      attempts,
      lastError: null,
      lastSyncedAt: syncedAt,
    });
    return { ok: true, status: "SYNCED" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sync error";
    const nextStatus = attempts >= 3 ? "FAILED" : "PENDING_RETRY";
    await updateOrderSyncStateDb(orderId, {
      status: nextStatus,
      attempts,
      lastError: message,
    });
    await logSecurityEventDb("SHEETS_SYNC_FAILED", "system", "", `Order ${orderId}: ${message}`);

    if (scheduleRetry && attempts < 3) {
      const delayMs = attempts * 15000;
      setTimeout(() => {
        syncOrderToGoogleSheets(orderId, true).catch(() => {});
      }, delayMs);
    }

    return { ok: false, status: nextStatus, error: message };
  }
}

export async function retryAllPendingSyncs() {
  const orders = (await listOrdersDb()).filter(
    (o) =>
      o.sheetsSyncStatus === "FAILED" ||
      o.sheetsSyncStatus === "PENDING_RETRY" ||
      o.sheetsSyncStatus === "PENDING"
  );
  const results = [];
  for (const o of orders) {
    results.push({ orderId: o.id, ...(await syncOrderToGoogleSheets(o.id, false)) });
  }
  return results;
}
