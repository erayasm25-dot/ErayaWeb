"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/common/Button";
import { container, formatPrice, cn } from "@/lib/utils";
import { CATEGORIES } from "@/data/categories";
import { Product } from "@/types/product";
import {
  OrderRecord,
  CustomOrderRecord,
  AdminOwnerSettings,
  PaymentStatus,
  OrderStatus,
  PickupStatus,
} from "@/types/order";

const field =
  "w-full min-h-[42px] px-3 py-2 bg-white border border-forest-dark/30 text-forest-dark text-sm font-sans focus:outline-none focus:border-forest-dark";

type Tab = "orders" | "products" | "custom" | "settings" | "security";

interface SecurityLogRow {
  id: number;
  created_at: string;
  event: string;
  actor: string;
  ip: string;
  details: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("orders");

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrderRecord[]>([]);
  const [settings, setSettings] = useState<AdminOwnerSettings | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New/Edit product state
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const loadAll = useCallback(async () => {
    const [oRes, pRes, cRes, sRes, lRes] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/admin/products"),
      fetch("/api/admin/custom-orders"),
      fetch("/api/admin/settings"),
      fetch("/api/admin/security-logs"),
    ]);
    if (oRes.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    const [oData, pData, cData, sData, lData] = await Promise.all([
      oRes.json(),
      pRes.json(),
      cRes.json(),
      sRes.json(),
      lRes.json(),
    ]);
    if (oData.ok) setOrders(oData.orders);
    if (pData.ok) setProducts(pData.products);
    if (cData.ok) setCustomOrders(cData.customOrders);
    if (sData.ok) setSettings(sData.settings);
    if (lData.ok) setSecurityLogs(lData.logs);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Incorrect owner password.");
      return;
    }
    setPassword("");
    await loadAll();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  const updateOrder = async (
    id: string,
    patch: { paymentStatus?: PaymentStatus; orderStatus?: OrderStatus; pickupStatus?: PickupStatus }
  ) => {
    setBusyId(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.ok && data.order) {
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      setNotice(`Order ${id} updated`);
    }
    setBusyId(null);
  };

  const retrySync = async (id: string) => {
    setBusyId(id);
    const res = await fetch(`/api/admin/orders/${id}/sync`, { method: "POST" });
    const data = await res.json();
    if (data.order) {
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    }
    setNotice(data.ok ? `Order ${id} synced to Google Sheets` : `Sync failed: ${data.result?.error || "Check webhook"}`);
    setBusyId(null);
  };

  const retryAllPending = async () => {
    setBusyId("all");
    await fetch("/api/admin/sync-pending", { method: "POST" });
    await loadAll();
    setNotice("Checked all pending Google Sheets syncs");
    setBusyId(null);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusyId("prod");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (data.ok) {
      setEditing(null);
      await loadAll();
      setNotice("Product saved");
    }
    setBusyId(null);
  };

  const deleteProduct = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadAll();
    setNotice("Product deleted");
    setBusyId(null);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setBusyId("settings");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (data.ok) {
      setSettings(data.settings);
      setNotice("Owner settings saved");
    }
    setBusyId(null);
  };

  const failedSyncCount = orders.filter(
    (o) => o.sheetsSyncStatus === "FAILED" || o.sheetsSyncStatus === "PENDING_RETRY"
  ).length;

  if (authed === null) {
    return <div className="py-24 text-center font-serif text-xl bg-ivory text-forest-dark">Loading dashboard…</div>;
  }

  if (!authed) {
    return (
      <section className="bg-ivory text-forest-dark py-20 min-h-[70vh]">
        <div className={`${container} max-w-md`}>
          <form onSubmit={login} className="p-8 bg-ivory-200 border border-gold space-y-5">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-forest" />
              <h1 className="font-serif text-3xl">Owner Dashboard</h1>
            </div>
            <p className="text-sm text-forest-dark/75 font-sans">
              Enter your owner password to manage orders, verify UPI payments, sync Google Sheets, and update store settings.
            </p>
            {loginError && <p className="text-xs text-[#8a2a1a] font-sans">{loginError}</p>}
            <div>
              <label htmlFor="adm-pw" className="block text-xs uppercase tracking-wider mb-1.5 font-sans">
                Password
              </label>
              <input
                id="adm-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                required
              />
            </div>
            <Button type="submit" variant="solid" className="w-full">Sign in</Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-8 flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">ERAYA Studio</p>
            <h1 className="font-serif font-normal text-3xl sm:text-4xl">Owner Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadAll}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-8 sm:py-12 min-h-[70vh]">
        <div className={container}>
          {notice && (
            <div className="mb-6 p-3.5 bg-white border border-gold flex items-center justify-between text-sm font-sans">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="text-xs underline">Dismiss</button>
            </div>
          )}

          {failedSyncCount > 0 && (
            <div className="mb-6 p-4 bg-[#FFF2CC] border border-[#B49A70] flex flex-wrap items-center justify-between gap-3 text-sm font-sans">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#7F6000]" />
                <span>
                  <strong>{failedSyncCount}</strong> order(s) pending Google Sheets synchronization.
                </span>
              </div>
              <Button size="sm" variant="solid" onClick={retryAllPending} disabled={busyId === "all"}>
                <RefreshCw className="w-3.5 h-3.5" /> Retry pending syncs
              </Button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-gold/40 mb-8 pb-3">
            {(
              [
                ["orders", `Orders (${orders.length})`, ShoppingBag],
                ["products", `Products (${products.length})`, Package],
                ["custom", `Custom Enquiries (${customOrders.length})`, MessageSquare],
                ["settings", "Owner Settings & UPI / Sheets", Settings],
                ["security", "Security Logs", ShieldCheck],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.14em] border shrink-0 transition-colors",
                  tab === key
                    ? "bg-forest-dark text-cream border-forest-dark"
                    : "bg-white border-forest-dark/30 hover:border-forest-dark"
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* ───────────── ORDERS TAB ───────────── */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="py-12 text-center text-forest-dark/70 font-sans border border-dashed border-forest-dark/30">
                  No orders yet. Orders placed at checkout will appear here automatically.
                </p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-5 sm:p-6 bg-ivory-200 border border-gold space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gold/30 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-serif text-2xl">{o.id}</h2>
                          <span className="text-xs px-2 py-0.5 bg-white border border-gold/50 font-sans">
                            {o.paymentMethod === "UPI" ? "UPI" : "Pay at Pickup"}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 font-sans border",
                              o.sheetsSyncStatus === "SYNCED"
                                ? "bg-[#D9EAD3] border-forest/40 text-forest-dark"
                                : o.sheetsSyncStatus === "FAILED" || o.sheetsSyncStatus === "PENDING_RETRY"
                                ? "bg-[#F4CCCC] border-[#990000]/40 text-[#990000]"
                                : "bg-white border-gold/50 text-forest-dark/70"
                            )}
                          >
                            Sheets: {o.sheetsSyncStatus}
                          </span>
                        </div>
                        <p className="text-sm font-sans mt-1">
                          <strong>{o.customerName}</strong> · {o.phone}
                          {o.email ? ` · ${o.email}` : ""}
                        </p>
                        <p className="text-xs text-forest-dark/65 font-sans mt-0.5">
                          Placed {new Date(o.createdAt).toLocaleString("en-IN")} · Pickup: {o.pickupPreference}
                        </p>
                        {o.upiReference && (
                          <p className="text-xs font-sans mt-1 bg-white inline-block px-2.5 py-1 border border-gold/40">
                            UPI Ref / UTR: <strong>{o.upiReference}</strong>
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-2xl block">{formatPrice(o.total)}</span>
                        <button
                          onClick={() => retrySync(o.id)}
                          disabled={busyId === o.id}
                          className="mt-1 inline-flex items-center gap-1 text-xs underline decoration-gold underline-offset-4"
                        >
                          <RefreshCw className="w-3 h-3" /> Sync to Sheets
                        </button>
                        {o.sheetsLastSyncedAt && (
                          <span className="block text-[11px] text-forest-dark/60 mt-0.5">
                            Last synced: {new Date(o.sheetsLastSyncedAt).toLocaleTimeString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="text-sm font-sans space-y-1">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>
                            [{it.productSku}] {it.productName} × {it.quantity}
                            {it.customisationDetails ? ` — "${it.customisationDetails}"` : ""}
                          </span>
                          <span>{formatPrice(it.itemTotal)}</span>
                        </li>
                      ))}
                    </ul>

                    {o.customerNotes && (
                      <p className="text-xs text-forest-dark/75 font-sans">Customer note: {o.customerNotes}</p>
                    )}

                    <div className="grid sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider mb-1 font-sans">
                          Payment status (Manual Verification)
                        </label>
                        <select
                          value={o.paymentStatus}
                          disabled={busyId === o.id}
                          onChange={(e) => updateOrder(o.id, { paymentStatus: e.target.value as PaymentStatus })}
                          className={field}
                        >
                          <option value="PENDING_VERIFICATION">Pending Verification</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="UNPAID">Unpaid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider mb-1 font-sans">
                          Order status
                        </label>
                        <select
                          value={o.orderStatus}
                          disabled={busyId === o.id}
                          onChange={(e) => updateOrder(o.id, { orderStatus: e.target.value as OrderStatus })}
                          className={field}
                        >
                          <option value="RECEIVED">Received</option>
                          <option value="CRAFTING">Crafting</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider mb-1 font-sans">
                          Pickup status
                        </label>
                        <select
                          value={o.pickupStatus}
                          disabled={busyId === o.id}
                          onChange={(e) => updateOrder(o.id, { pickupStatus: e.target.value as PickupStatus })}
                          className={field}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="READY">Ready</option>
                          <option value="PICKED_UP">Picked Up</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ───────────── PRODUCTS TAB ───────────── */}
          {tab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl">Catalogue Management</h2>
                <Button
                  size="sm"
                  variant="solid"
                  onClick={() =>
                    setEditing({
                      name: "",
                      sku: "",
                      category: "clay-keychains",
                      price: 299,
                      availability: "available",
                      stockCount: 1,
                      isNew: true,
                      isFeatured: false,
                      isBestseller: false,
                      isDemo: false,
                      images: [],
                      description: "",
                      materials: [],
                      customisable: true,
                    })
                  }
                >
                  <Plus className="w-4 h-4" /> Add product
                </Button>
              </div>

              {editing && (
                <form onSubmit={saveProduct} className="p-6 bg-ivory-200 border border-gold space-y-4">
                  <h3 className="font-serif text-2xl">{editing.id ? "Edit product" : "New product"}</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs mb-1">Name *</label>
                      <input
                        required
                        value={editing.name || ""}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">SKU</label>
                      <input
                        value={editing.sku || ""}
                        onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                        placeholder="e.g. ERY-CLAY-03"
                        className={field}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Category</label>
                      <select
                        value={editing.category || "clay-keychains"}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value as Product["category"] })}
                        className={field}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs mb-1">Price (₹ INR) *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editing.price || 0}
                        onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Availability</label>
                      <select
                        value={editing.availability || "available"}
                        onChange={(e) => setEditing({ ...editing, availability: e.target.value as Product["availability"] })}
                        className={field}
                      >
                        <option value="available">Available (Ready stock)</option>
                        <option value="made-to-order">Made to order</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Stock count (optional)</label>
                      <input
                        type="number"
                        min={0}
                        value={editing.stockCount ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, stockCount: e.target.value === "" ? null : Number(e.target.value) })
                        }
                        className={field}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1">Image URLs (comma-separated, e.g. /images/products/clay-1.jpg)</label>
                    <input
                      value={(editing.images || []).join(", ")}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className={field}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editing.description || ""}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      className={field}
                    />
                  </div>

                  <div className="flex flex-wrap gap-5 text-sm font-sans">
                    {(
                      [
                        ["isNew", "New Arrival"],
                        ["isFeatured", "Featured"],
                        ["isBestseller", "Bestseller"],
                        ["customisable", "Customisable"],
                        ["isDemo", "Demo listing"],
                      ] as const
                    ).map(([k, lbl]) => (
                      <label key={k} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editing[k])}
                          onChange={(e) => setEditing({ ...editing, [k]: e.target.checked })}
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" variant="solid" disabled={busyId === "prod"}>Save product</Button>
                    <Button type="button" variant="line" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-gold/30 border border-gold bg-ivory-200">
                {products.map((p) => (
                  <div key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl">{p.name}</p>
                      <p className="text-xs text-forest-dark/70 font-sans">
                        {p.sku} · {p.categoryName} · {formatPrice(p.price)} · {p.availability}
                        {p.isDemo ? " · Demo" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="line" onClick={() => setEditing(p)}>Edit</Button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="w-10 h-10 flex items-center justify-center border border-forest-dark/30 hover:bg-[#8a2a1a] hover:text-white"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── CUSTOM ORDERS TAB ───────────── */}
          {tab === "custom" && (
            <div className="space-y-4">
              {customOrders.length === 0 ? (
                <p className="py-12 text-center text-forest-dark/70 font-sans border border-dashed border-forest-dark/30">
                  No custom order enquiries yet.
                </p>
              ) : (
                customOrders.map((c) => (
                  <div key={c.id} className="p-5 bg-ivory-200 border border-gold flex flex-wrap justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <p className="text-xs uppercase tracking-wider text-gold-800">{c.id} · {c.category}</p>
                      <h3 className="font-serif text-2xl">{c.name} ({c.phone})</h3>
                      <p className="text-sm font-sans">{c.request}</p>
                      {c.budget && <p className="text-xs text-forest-dark/70">Preferred budget: ₹{c.budget}</p>}
                    </div>
                    {c.referenceImageData && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.referenceImageData} alt="Reference" className="w-24 h-24 object-cover border border-gold" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ───────────── SETTINGS TAB ───────────── */}
          {tab === "settings" && settings && (
            <form onSubmit={saveSettings} className="max-w-2xl p-6 sm:p-8 bg-ivory-200 border border-gold space-y-5">
              <h2 className="font-serif text-3xl">UPI, Pickup &amp; Google Sheets Settings</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">Owner UPI ID</label>
                  <input
                    value={settings.upiId}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">UPI Payee Name</label>
                  <input
                    value={settings.upiName}
                    onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                    className={field}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">
                  Custom UPI QR Code Image (optional — leave blank to auto-generate QR from UPI ID)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setSettings({ ...settings, upiQrImage: reader.result });
                      }
                    };
                    reader.readAsDataURL(f);
                  }}
                  className="text-sm"
                />
                {settings.upiQrImage && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.upiQrImage} alt="QR preview" className="w-20 h-20 object-contain border border-gold bg-white" />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, upiQrImage: "" })}
                      className="text-xs underline"
                    >
                      Remove custom QR
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1">Self-Pickup Address / Instructions</label>
                <textarea
                  rows={2}
                  value={settings.pickupAddress}
                  onChange={(e) => setSettings({ ...settings, pickupAddress: e.target.value })}
                  className={field}
                />
              </div>

              <div className="pt-4 border-t border-gold/40 space-y-3">
                <h3 className="font-serif text-2xl">Google Sheets Synchronization</h3>
                <p className="text-xs text-forest-dark/75 font-sans">
                  Deploy <code>scripts/google-apps-script.gs</code> as a Web App in your Google Sheet and paste the URL &amp; shared secret below.
                </p>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">Google Apps Script Webhook URL</label>
                  <input
                    value={settings.googleSheetsWebhookUrl}
                    onChange={(e) => setSettings({ ...settings, googleSheetsWebhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className={field}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1">Shared Secret Token</label>
                  <input
                    type="password"
                    value={settings.googleSheetsSecret}
                    onChange={(e) => setSettings({ ...settings, googleSheetsSecret: e.target.value })}
                    className={field}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="solid" disabled={busyId === "settings"}>
                  <CheckCircle2 className="w-4 h-4" /> Save settings
                </Button>
                <a
                  href="/api/admin/backup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-xs uppercase tracking-[0.14em] border border-forest-dark/60 text-forest-dark hover:bg-forest-dark hover:text-cream transition-colors font-sans font-medium"
                >
                  Download Database Backup (JSON)
                </a>
              </div>
            </form>
          )}

          {/* ───────────── SECURITY LOGS TAB ───────────── */}
          {tab === "security" && (
            <div className="border border-gold bg-ivory-200 divide-y divide-gold/30">
              {securityLogs.length === 0 ? (
                <p className="p-8 text-center text-sm text-forest-dark/70 font-sans">
                  No security events recorded yet.
                </p>
              ) : (
                securityLogs.map((l) => (
                  <div key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-sm font-sans">
                    <div>
                      <span className="font-semibold text-forest-dark">{l.event}</span>
                      <span className="text-xs text-forest-dark/65 ml-2">
                        ({l.actor} · {l.ip || "local"})
                      </span>
                      {l.details && (
                        <p className="text-xs text-forest-dark/75 mt-0.5">{l.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-forest-dark/60 shrink-0">
                      {new Date(l.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
