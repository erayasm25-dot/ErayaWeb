import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSettings, updateAdminSettings, logSecurityEventDb } from "@/lib/db";
import { getClientIp, validateBase64Image, verifySameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, settings: await getAdminSettings() });
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

    if (body.upiQrImage && typeof body.upiQrImage === "string" && body.upiQrImage.trim() !== "") {
      const qr = body.upiQrImage.trim();
      if (qr.startsWith("data:")) {
        const imgCheck = validateBase64Image(qr, 2 * 1024 * 1024);
        if (!imgCheck.ok) {
          return NextResponse.json({ ok: false, error: imgCheck.error }, { status: 400 });
        }
      } else if (!qr.startsWith("/images/") && !qr.startsWith("https://")) {
        return NextResponse.json({ ok: false, error: "Invalid QR image URL." }, { status: 400 });
      }
    }

    if (
      body.googleSheetsWebhookUrl &&
      typeof body.googleSheetsWebhookUrl === "string" &&
      body.googleSheetsWebhookUrl.trim() !== ""
    ) {
      try {
        const u = new URL(body.googleSheetsWebhookUrl.trim());
        if (u.protocol !== "https:") {
          return NextResponse.json({ ok: false, error: "Webhook URL must use HTTPS." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid Webhook URL." }, { status: 400 });
      }
    }

    const updated = await updateAdminSettings({
      upiId: body.upiId,
      upiName: body.upiName,
      upiQrImage: body.upiQrImage,
      pickupAddress: body.pickupAddress,
      pickupSlots: Array.isArray(body.pickupSlots) ? body.pickupSlots : undefined,
      googleSheetsWebhookUrl: body.googleSheetsWebhookUrl,
      googleSheetsSecret: body.googleSheetsSecret,
    });
    await logSecurityEventDb("ADMIN_SETTINGS_UPDATED", "admin", getClientIp(req), "Owner settings updated");
    return NextResponse.json({ ok: true, settings: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save settings" }, { status: 400 });
  }
}
