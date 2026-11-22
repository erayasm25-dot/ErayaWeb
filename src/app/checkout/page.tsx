"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Store,
  Copy,
  Search,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { formatPrice, container, cn } from "@/lib/utils";
import Button from "@/components/common/Button";
import ProductImage from "@/components/common/ProductImage";
import QuantityStepper from "@/components/common/QuantityStepper";
import { OrderRecord, PaymentMethod, PublicOwnerSettings } from "@/types/order";

const field =
  "w-full min-h-[46px] px-3.5 py-2.5 bg-white border border-forest-dark/30 text-forest-dark text-[15px] font-sans placeholder:text-forest-dark/40 focus:outline-none focus:border-forest-dark";

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showToast } = useUI();

  const [settings, setSettings] = useState<PublicOwnerSettings | null>(null);
  const [generatedQr, setGeneratedQr] = useState<string>("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupPreference, setPickupPreference] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [itemCustomisations, setItemCustomisations] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [upiReference, setUpiReference] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderRecord | null>(null);
  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.settings) {
          setSettings(d.settings);
          if (d.settings.pickupSlots?.length > 0) {
            setPickupPreference(d.settings.pickupSlots[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Generate dynamic UPI QR code when no static QR image is uploaded by owner
  useEffect(() => {
    if (!settings) return;
    if (settings.upiQrImage) {
      setGeneratedQr(settings.upiQrImage);
      return;
    }
    if (settings.upiId && subtotal > 0) {
      const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
        settings.upiName || "ERAYA"
      )}&am=${subtotal}&cu=INR`;
      QRCode.toDataURL(upiUri, {
        width: 240,
        margin: 2,
        color: { dark: "#173013", light: "#F5F1E7" },
      })
        .then(setGeneratedQr)
        .catch(() => {});
    }
  }, [settings, subtotal]);

  const validate = () => {
    const er: Record<string, string> = {};
    if (customerName.trim().length < 2) er.customerName = "Please enter your full name.";
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+?91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) er.phone = "Enter a valid 10-digit mobile number.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      er.email = "Enter a valid email address.";
    }
    if (!pickupPreference) er.pickupPreference = "Select a pickup preference.";
    if (paymentMethod === "UPI" && upiReference.trim().length < 6) {
      er.upiReference = "Enter the UPI transaction reference / UTR (at least 6 characters).";
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          pickupPreference,
          customerNotes,
          paymentMethod,
          upiReference: paymentMethod === "UPI" ? upiReference : "",
          idempotencyKey,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            customisationDetails: itemCustomisations[i.product.id] || i.customNote || "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors({ server: data.error || "Could not place order. Please check your details." });
        return;
      }
      setPlacedOrder(data.order);
      clearCart();
      showToast(`Order ${data.order.id} placed`);
    } catch {
      setErrors({ server: "Network error while placing order. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const copyUpiId = async () => {
    if (!settings?.upiId) return;
    try {
      await navigator.clipboard.writeText(settings.upiId);
      showToast(`Copied UPI ID: ${settings.upiId}`);
    } catch {
      showToast("Copy failed — please select the UPI ID manually.");
    }
  };

  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-10 sm:py-14`}>
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-4 font-sans"
          >
            <Link href="/" className="hover:text-gold">Home</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <Link href="/shop" className="hover:text-gold">Shop</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">Checkout</span>
          </nav>
          <h1 className="font-serif font-normal display-md">
            {placedOrder ? "Order received" : "Self-pickup checkout"}
          </h1>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-12 sm:py-16">
        <div className={container}>
          {placedOrder ? (
            <div className="max-w-2xl mx-auto p-6 sm:p-10 bg-ivory-200 border border-gold space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gold-800">
                    Order ID
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl">{placedOrder.id}</h2>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 p-4 bg-white border border-gold/40 text-sm font-sans">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60">
                    Payment status
                  </span>
                  <strong className="text-forest-dark">
                    {placedOrder.paymentStatus === "PENDING_VERIFICATION"
                      ? "Pending Verification"
                      : "Unpaid (Pay at Pickup)"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60">
                    Order status
                  </span>
                  <strong>{placedOrder.orderStatus}</strong>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60">
                    Total
                  </span>
                  <strong>{formatPrice(placedOrder.total)}</strong>
                </div>
              </div>

              <p className="text-sm text-forest-dark/80 font-sans leading-relaxed">
                {placedOrder.paymentMethod === "UPI"
                  ? `Your UPI transaction reference (${placedOrder.upiReference}) has been recorded. Payment stays "Pending Verification" until the ERAYA owner manually verifies the transfer.`
                  : "Your self-pickup order is recorded. Payment can be completed when collecting your order."}
              </p>

              <div className="border-t border-gold/40 pt-4">
                <h3 className="font-serif text-xl mb-3">Items</h3>
                <ul className="space-y-2 text-sm font-sans">
                  {placedOrder.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between gap-4">
                      <span>
                        {it.productName} × {it.quantity}
                        {it.customisationDetails && (
                          <span className="block text-xs text-forest-dark/65">
                            Note: {it.customisationDetails}
                          </span>
                        )}
                      </span>
                      <span className="font-medium shrink-0">{formatPrice(it.itemTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="solid"
                  href={`/track?orderId=${encodeURIComponent(placedOrder.id)}`}
                >
                  <Search className="w-4 h-4" /> Track this order
                </Button>
                <Button variant="line" href="/shop">Continue shopping</Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-14 border border-dashed border-forest-dark/30 px-6">
              <ShoppingBag className="w-8 h-8 mx-auto text-forest/50 mb-4" />
              <h2 className="font-serif text-3xl mb-2">Your cart is empty</h2>
              <p className="text-sm text-forest-dark/70 font-sans mb-6">
                Add a piece from the collection before checking out.
              </p>
              <Button variant="solid" href="/shop">Browse the shop</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-12 gap-10">
              {/* Left: Customer & Payment Form */}
              <div className="lg:col-span-7 space-y-8">
                {errors.server && (
                  <div className="p-4 bg-white border border-[#8a2a1a] text-sm text-[#8a2a1a] flex gap-2.5 items-start" role="alert">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{errors.server}</span>
                  </div>
                )}

                {/* Customer details */}
                <div className="p-6 sm:p-8 border border-gold/50 bg-ivory-200 space-y-4">
                  <h2 className="font-serif text-2xl">1. Contact &amp; pickup details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chk-name" className="block text-[13px] font-medium mb-1.5 font-sans">
                        Full name *
                      </label>
                      <input
                        id="chk-name"
                        autoComplete="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your full name"
                        className={cn(field, errors.customerName && "border-[#8a2a1a]")}
                      />
                      {errors.customerName && <p className="mt-1 text-xs text-[#8a2a1a]">{errors.customerName}</p>}
                    </div>
                    <div>
                      <label htmlFor="chk-phone" className="block text-[13px] font-medium mb-1.5 font-sans">
                        Mobile number *
                      </label>
                      <input
                        id="chk-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className={cn(field, errors.phone && "border-[#8a2a1a]")}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-[#8a2a1a]">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chk-email" className="block text-[13px] font-medium mb-1.5 font-sans">
                        Email (optional)
                      </label>
                      <input
                        id="chk-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={cn(field, errors.email && "border-[#8a2a1a]")}
                      />
                      {errors.email && <p className="mt-1 text-xs text-[#8a2a1a]">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="chk-pickup" className="block text-[13px] font-medium mb-1.5 font-sans">
                        Self-pickup preference *
                      </label>
                      <select
                        id="chk-pickup"
                        value={pickupPreference}
                        onChange={(e) => setPickupPreference(e.target.value)}
                        className={cn(field, errors.pickupPreference && "border-[#8a2a1a]")}
                      >
                        {(settings?.pickupSlots || ["Flexible — contact me to schedule"]).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.pickupPreference && <p className="mt-1 text-xs text-[#8a2a1a]">{errors.pickupPreference}</p>}
                    </div>
                  </div>

                  {settings?.pickupAddress && (
                    <p className="text-xs text-forest-dark/75 font-sans bg-white/80 p-3 border border-gold/30">
                      <strong>Self-pickup model:</strong> {settings.pickupAddress}
                    </p>
                  )}

                  <div>
                    <label htmlFor="chk-notes" className="block text-[13px] font-medium mb-1.5 font-sans">
                      Order notes (optional)
                    </label>
                    <textarea
                      id="chk-notes"
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Gift note, preferred pickup day, or anything else…"
                      className={cn(field, "resize-none")}
                    />
                  </div>
                </div>

                {/* Payment */}
                <div className="p-6 sm:p-8 border border-gold/50 bg-ivory-200 space-y-5">
                  <h2 className="font-serif text-2xl">2. Payment method</h2>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={cn(
                        "p-4 text-left border flex items-start gap-3 transition-colors",
                        paymentMethod === "UPI"
                          ? "bg-forest text-cream border-forest"
                          : "bg-white border-forest-dark/30 hover:border-forest-dark"
                      )}
                    >
                      <QrCode className="w-5 h-5 shrink-0 mt-0.5 text-gold" />
                      <div>
                        <span className="block font-medium text-sm">UPI Payment (Manual)</span>
                        <span className={cn("block text-xs mt-0.5", paymentMethod === "UPI" ? "text-cream/75" : "text-forest-dark/65")}>
                          Scan QR, pay via any UPI app &amp; enter UTR
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PAY_AT_PICKUP")}
                      className={cn(
                        "p-4 text-left border flex items-start gap-3 transition-colors",
                        paymentMethod === "PAY_AT_PICKUP"
                          ? "bg-forest text-cream border-forest"
                          : "bg-white border-forest-dark/30 hover:border-forest-dark"
                      )}
                    >
                      <Store className="w-5 h-5 shrink-0 mt-0.5 text-gold" />
                      <div>
                        <span className="block font-medium text-sm">Pay at Pickup</span>
                        <span className={cn("block text-xs mt-0.5", paymentMethod === "PAY_AT_PICKUP" ? "text-cream/75" : "text-forest-dark/65")}>
                          Settle in person upon self-pickup
                        </span>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === "UPI" && (
                    <div className="p-5 bg-white border border-gold/50 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-5 items-center">
                        {generatedQr && (
                          <div className="p-2 bg-ivory border border-gold/50 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={generatedQr}
                              alt="ERAYA UPI QR Code"
                              className="w-40 h-40 object-contain"
                            />
                          </div>
                        )}
                        <div className="space-y-2 text-sm font-sans">
                          <p className="font-medium text-forest-dark">
                            Pay {formatPrice(subtotal)} to {settings?.upiName || "ERAYA Handmade"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="px-2.5 py-1 bg-ivory border border-gold/40 text-xs">
                              {settings?.upiId || "eraya@upi"}
                            </code>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="inline-flex items-center gap-1 text-xs underline decoration-gold underline-offset-4"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy UPI ID
                            </button>
                          </div>
                          <p className="text-xs text-forest-dark/70 leading-relaxed">
                            1. Scan the QR code or copy the UPI ID in GPay, PhonePe, Paytm, or BHIM.
                            <br />
                            2. Complete payment of <strong>{formatPrice(subtotal)}</strong> externally.
                            <br />
                            3. Enter your 12-digit UPI transaction reference / UTR below. Your payment will be marked <strong>Pending Verification</strong> until the owner confirms receipt.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="chk-utr" className="block text-[13px] font-medium mb-1.5 font-sans">
                          UPI Transaction Reference / UTR *
                        </label>
                        <input
                          id="chk-utr"
                          value={upiReference}
                          onChange={(e) => setUpiReference(e.target.value)}
                          placeholder="e.g. 432718904512"
                          className={cn(field, errors.upiReference && "border-[#8a2a1a]")}
                        />
                        {errors.upiReference && <p className="mt-1 text-xs text-[#8a2a1a]">{errors.upiReference}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
                </Link>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-8 border border-gold bg-ivory-200 space-y-5 sticky top-32">
                  <h2 className="font-serif text-2xl">Order summary</h2>
                  <ul className="divide-y divide-gold/30 border-y border-gold/30">
                    {items.map(({ product, quantity }) => (
                      <li key={product.id} className="py-4 space-y-2.5">
                        <div className="flex gap-3">
                          <Link href={`/shop/${product.slug}`} className="shrink-0">
                            <ProductImage product={product} compact sizes="64px" className="w-14 h-16" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <Link href={`/shop/${product.slug}`} className="font-serif text-lg leading-snug hover:text-forest">
                                {product.name}
                              </Link>
                              <span className="font-serif text-lg shrink-0">
                                {formatPrice(product.price * quantity)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <QuantityStepper
                                size="sm"
                                value={quantity}
                                onChange={(n) => updateQuantity(product.id, n)}
                              />
                              <button
                                type="button"
                                onClick={() => removeFromCart(product.id)}
                                className="text-xs underline underline-offset-4 text-forest-dark/65 hover:text-forest-dark"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                        {product.customisable && (
                          <input
                            type="text"
                            value={itemCustomisations[product.id] || ""}
                            onChange={(e) =>
                              setItemCustomisations((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                            placeholder="Optional customisation note for this item…"
                            className="w-full px-3 py-1.5 bg-white border border-gold/40 text-xs font-sans focus:outline-none focus:border-forest-dark"
                          />
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 text-sm font-sans">
                    <div className="flex justify-between text-forest-dark/80">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-forest-dark/80">
                      <span>Fulfilment</span>
                      <span>Self-pickup (₹0)</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-gold/40">
                      <span className="font-serif text-xl">Total</span>
                      <span className="font-serif text-3xl">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <Button type="submit" variant="solid" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Placing order…" : "Place order"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
