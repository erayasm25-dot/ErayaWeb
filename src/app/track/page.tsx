"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, Clock, PackageCheck, XCircle, Sparkles } from "lucide-react";
import Button from "@/components/common/Button";
import { container, formatPrice, cn } from "@/lib/utils";
import { OrderRecord } from "@/types/order";

const field =
  "w-full min-h-[46px] px-3.5 py-2.5 bg-white border border-forest-dark/30 text-forest-dark text-[15px] font-sans placeholder:text-forest-dark/40 focus:outline-none focus:border-forest-dark";

const STEPS = [
  { key: "RECEIVED", label: "Order Received", icon: CheckCircle2 },
  { key: "CRAFTING", label: "Being Crafted", icon: Sparkles },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: PackageCheck },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2 },
] as const;

function TrackContent() {
  const sp = useSearchParams();
  const [orderId, setOrderId] = useState(sp.get("orderId") || "");
  const [phone, setPhone] = useState(sp.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);

  const lookup = async (oid: string, ph: string) => {
    if (!oid.trim() || !ph.trim()) {
      setError("Please enter both your Order ID and mobile number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(oid.trim())}&phone=${encodeURIComponent(ph.trim())}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setOrder(null);
        setError(data.error || "Order not found.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Could not look up your order right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const oid = sp.get("orderId");
    const ph = sp.get("phone");
    if (oid && ph) {
      lookup(oid, ph);
    }
  }, [sp]);

  const activeIdx = order
    ? STEPS.findIndex((s) => s.key === order.orderStatus)
    : -1;

  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-12 sm:py-16`}>
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-4 font-sans"
          >
            <Link href="/" className="hover:text-gold">Home</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">Track Order</span>
          </nav>
          <h1 className="font-serif font-normal display-lg">Track your order</h1>
          <p className="mt-4 max-w-xl text-base text-ivory/80 font-sans leading-relaxed">
            Enter your Order ID and mobile number to check live payment verification and pickup status.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-12 sm:py-16">
        <div className={`${container} max-w-3xl space-y-8`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(orderId, phone);
            }}
            className="p-6 sm:p-8 bg-ivory-200 border border-gold grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end"
          >
            <div>
              <label htmlFor="trk-id" className="block text-[13px] font-medium mb-1.5 font-sans">
                Order ID
              </label>
              <input
                id="trk-id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ERY-20261122-XXXX"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="trk-phone" className="block text-[13px] font-medium mb-1.5 font-sans">
                Mobile number
              </label>
              <input
                id="trk-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className={field}
              />
            </div>
            <Button type="submit" variant="solid" disabled={loading}>
              <Search className="w-4 h-4" /> {loading ? "Checking…" : "Track"}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-white border border-[#8a2a1a] text-sm text-[#8a2a1a] font-sans" role="alert">
              {error}
            </div>
          )}

          {order && (
            <div className="p-6 sm:p-8 bg-ivory-200 border border-gold space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-gold/40">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold-800">
                    Order ID
                  </p>
                  <h2 className="font-serif text-3xl">{order.id}</h2>
                  <p className="text-xs text-forest-dark/65 font-sans mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-forest-dark/60 block">
                    Total
                  </span>
                  <span className="font-serif text-3xl">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Status summary pills */}
              <div className="grid sm:grid-cols-3 gap-3 text-sm font-sans">
                <div className="p-3.5 bg-white border border-gold/40">
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60 mb-1">
                    Payment status
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    {order.paymentStatus === "VERIFIED" && <CheckCircle2 className="w-4 h-4 text-forest" />}
                    {order.paymentStatus === "PENDING_VERIFICATION" && <Clock className="w-4 h-4 text-gold-800" />}
                    {order.paymentStatus === "REJECTED" && <XCircle className="w-4 h-4 text-[#8a2a1a]" />}
                    {order.paymentStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="p-3.5 bg-white border border-gold/40">
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60 mb-1">
                    Order status
                  </span>
                  <strong className="font-medium">{order.orderStatus.replace(/_/g, " ")}</strong>
                </div>

                <div className="p-3.5 bg-white border border-gold/40">
                  <span className="block text-[11px] uppercase tracking-wider text-forest-dark/60 mb-1">
                    Pickup status
                  </span>
                  <strong className="font-medium">{order.pickupStatus.replace(/_/g, " ")}</strong>
                </div>
              </div>

              {/* Stepper */}
              {order.orderStatus !== "CANCELLED" ? (
                <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {STEPS.map((s, idx) => {
                    const done = activeIdx >= idx;
                    const Icon = s.icon;
                    return (
                      <li
                        key={s.key}
                        className={cn(
                          "p-3.5 border text-xs font-sans flex flex-col gap-2",
                          done
                            ? "bg-forest text-cream border-forest"
                            : "bg-white text-forest-dark/60 border-gold/40"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", done ? "text-gold" : "text-forest-dark/40")} />
                        <span className="font-medium">{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="p-4 bg-white border border-[#8a2a1a] text-sm text-[#8a2a1a] font-sans">
                  This order has been cancelled.
                </p>
              )}

              {/* Items */}
              <div className="border-t border-gold/40 pt-5">
                <h3 className="font-serif text-xl mb-3">Order items</h3>
                <ul className="divide-y divide-gold/25 text-sm font-sans">
                  {order.items.map((it, idx) => (
                    <li key={idx} className="py-2.5 flex justify-between gap-4">
                      <div>
                        <span className="font-medium">{it.productName}</span> × {it.quantity}
                        {it.customisationDetails && (
                          <span className="block text-xs text-forest-dark/65">
                            Customisation: {it.customisationDetails}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 font-medium">{formatPrice(it.itemTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-serif text-xl">Loading order tracker…</div>}>
      <TrackContent />
    </Suspense>
  );
}
