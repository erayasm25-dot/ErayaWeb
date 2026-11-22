/**
 * ERAYA — Google Apps Script for Automated Order Synchronization
 * ----------------------------------------------------------------------------
 * Setup:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this entire file and save.
 * 3. Set SCRIPT_SECRET below to match GOOGLE_SHEETS_SECRET in your server env
 *    (or Owner Admin Dashboard -> Settings).
 * 4. Click Deploy -> New deployment -> Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into Owner Admin Dashboard -> Settings (or .env.local).
 */

const SCRIPT_SECRET = "eraya-sheets-secret-2026";
const ORDERS_SHEET = "ERAYA ORDERS";
const ITEMS_SHEET = "ORDER ITEMS";

const ORDER_HEADERS = [
  "Order ID",
  "Order Date",
  "Customer Name",
  "Phone Number",
  "Email",
  "Product Name",
  "Product SKU",
  "Category",
  "Quantity",
  "Unit Price",
  "Item Total",
  "Order Total",
  "Customisation Details",
  "Payment Method",
  "UPI Transaction Reference",
  "Payment Status",
  "Order Status",
  "Pickup Status",
  "Customer Notes",
  "Google Sheets Sync Status",
];

const ITEM_HEADERS = [
  "Order ID",
  "Product SKU",
  "Product Name",
  "Category",
  "Quantity",
  "Unit Price",
  "Item Total",
  "Customisation Details",
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (SCRIPT_SECRET && body.secret !== SCRIPT_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = ensureOrdersSheet(ss);
    const itemsSheet = ensureItemsSheet(ss);

    if (body.action === "upsert_order" && body.order) {
      upsertOrderRow(ordersSheet, body.order);
      if (Array.isArray(body.items)) {
        replaceOrderItems(itemsSheet, body.order.orderId, body.items);
      }
      return jsonResponse({ ok: true, orderId: body.order.orderId });
    }

    return jsonResponse({ ok: false, error: "Unsupported action" });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ensureOrdersSheet(ss) {
  let sheet = ss.getSheetByName(ORDERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET);
    sheet.appendRow(ORDER_HEADERS);
    styleHeader(sheet, ORDER_HEADERS.length);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, ORDER_HEADERS.length).createFilter();

    // Column widths
    const widths = [170, 150, 160, 130, 180, 240, 130, 140, 90, 110, 110, 110, 220, 130, 180, 170, 150, 130, 220, 150];
    widths.forEach((w, idx) => sheet.setColumnWidth(idx + 1, w));

    // Formats: Date (col 2), INR Currency (cols 10, 11, 12)
    sheet.getRange("B2:B1000").setNumberFormat("yyyy-mm-dd hh:mm");
    sheet.getRange("J2:L1000").setNumberFormat("₹#,##0");

    // Conditional formatting for statuses (cols P, Q, R)
    const rules = sheet.getConditionalFormatRules();
    const pRange = sheet.getRange("P2:P1000");
    rules.push(
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("VERIFIED").setBackground("#D9EAD3").setFontColor("#173013").setRanges([pRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("PENDING_VERIFICATION").setBackground("#FFF2CC").setFontColor("#7F6000").setRanges([pRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("REJECTED").setBackground("#F4CCCC").setFontColor("#990000").setRanges([pRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("UNPAID").setBackground("#FCE5CD").setFontColor("#783F04").setRanges([pRange]).build()
    );
    const qRange = sheet.getRange("Q2:Q1000");
    rules.push(
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("COMPLETED").setBackground("#D9EAD3").setFontColor("#173013").setRanges([qRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("READY_FOR_PICKUP").setBackground("#CFE2F3").setFontColor("#0B5394").setRanges([qRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("CANCELLED").setBackground("#F4CCCC").setFontColor("#990000").setRanges([qRange]).build()
    );
    sheet.setConditionalFormatRules(rules);
  }
  return sheet;
}

function ensureItemsSheet(ss) {
  let sheet = ss.getSheetByName(ITEMS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ITEMS_SHEET);
    sheet.appendRow(ITEM_HEADERS);
    styleHeader(sheet, ITEM_HEADERS.length);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, ITEM_HEADERS.length).createFilter();
    sheet.getRange("F2:G2000").setNumberFormat("₹#,##0");
  }
  return sheet;
}

function styleHeader(sheet, colCount) {
  sheet
    .getRange(1, 1, 1, colCount)
    .setBackground("#173013")
    .setFontColor("#F8E9C5")
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.setRowHeight(1, 34);
}

function safeCell(val) {
  var s = String(val === null || val === undefined ? "" : val).replace(/[\r\n]+/g, " ");
  if (/^\s*[=+\-@\t]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function upsertOrderRow(sheet, o) {
  const values = [
    safeCell(o.orderId),
    new Date(o.orderDate),
    safeCell(o.customerName),
    "'" + String(o.phoneNumber || "").replace(/^'+/, ""),
    safeCell(o.email || ""),
    safeCell(o.productName),
    safeCell(o.productSku),
    safeCell(o.category),
    Number(o.quantity) || 0,
    o.unitPrice,
    Number(o.itemTotal) || 0,
    Number(o.orderTotal) || 0,
    safeCell(o.customisationDetails || ""),
    safeCell(o.paymentMethod),
    safeCell(o.upiTransactionReference || ""),
    safeCell(o.paymentStatus),
    safeCell(o.orderStatus),
    safeCell(o.pickupStatus),
    safeCell(o.customerNotes || ""),
    safeCell(o.googleSheetsSyncStatus || "SYNCED"),
  ];

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(o.orderId)) {
        sheet.getRange(i + 2, 1, 1, values.length).setValues([values]);
        return;
      }
    }
  }
  sheet.appendRow(values);
}

function replaceOrderItems(sheet, orderId, items) {
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) {
      if (String(ids[i][0]) === String(orderId)) {
        sheet.deleteRow(i + 2);
      }
    }
  }
  items.forEach((it) => {
    sheet.appendRow([
      safeCell(it.orderId),
      safeCell(it.productSku),
      safeCell(it.productName),
      safeCell(it.category),
      Number(it.quantity) || 0,
      Number(it.unitPrice) || 0,
      Number(it.itemTotal) || 0,
      safeCell(it.customisationDetails || ""),
    ]);
  });
}
