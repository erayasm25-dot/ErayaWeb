"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, LayoutGrid, List, Search, X } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { CATEGORIES, CATEGORY_GROUPS, categoriesInGroup } from "@/data/categories";
import { Availability, Product, ProductCategory } from "@/types/product";
import ProductGrid from "@/components/products/ProductGrid";
import Drawer from "@/components/common/Drawer";
import Button from "@/components/common/Button";
import { productMatches } from "@/lib/search";
import { container, cn } from "@/lib/utils";
import { useUI } from "@/context/UIContext";

type Sort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

const PRICES = MOCK_PRODUCTS.map((p) => p.price);
const PRICE_MIN = Math.min(...PRICES);
const PRICE_MAX = Math.max(...PRICES);

interface Filters {
  cats: ProductCategory[];
  avail: Availability[];
  min: string;
  max: string;
  q: string;
}

const emptyFilters: Filters = { cats: [], avail: [], min: "", max: "", q: "" };

function fromParams(sp: URLSearchParams): { filters: Filters; sort: Sort } {
  const category = sp.get("category") as ProductCategory | null;
  const group = sp.get("group");
  let cats: ProductCategory[] = [];
  if (category && CATEGORIES.some((c) => c.id === category)) cats = [category];
  else if (group) cats = categoriesInGroup(group as never).map((c) => c.id);
  const sort = (sp.get("sort") as Sort) || "featured";
  return {
    filters: { ...emptyFilters, cats, q: sp.get("q") ?? "" },
    sort: SORTS.some((s) => s.value === sort) ? sort : "featured",
  };
}

const checkbox =
  "w-[18px] h-[18px] shrink-0 accent-[#173013] cursor-pointer";

function FilterPanel({
  filters,
  setFilters,
  counts,
  priceMin,
  priceMax,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  counts: Record<string, number>;
  priceMin: number;
  priceMax: number;
}) {
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const h = "text-[11px] uppercase tracking-[0.24em] text-gold-800 mb-3 block font-sans font-medium";
  const row = "flex items-center gap-3 min-h-[40px] text-[15px] font-sans cursor-pointer";
  const numInput =
    "w-full min-h-[44px] px-3 bg-white border border-forest-dark/30 text-[15px] focus:outline-none focus:border-forest-dark font-sans";

  return (
    <div className="space-y-8 text-forest-dark">
      <div>
        <label htmlFor="shop-q" className={h}>Search in shop</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest/60" />
          <input
            id="shop-q"
            type="search"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Keychain, bouquet, lamp…"
            className={cn(numInput, "pl-9")}
          />
        </div>
      </div>

      <fieldset>
        <legend className={h}>Category</legend>
        {CATEGORY_GROUPS.map((g) => (
          <div key={g.id} className="mb-3">
            <p className="text-xs text-forest-dark/60 mb-1 font-sans">{g.label}</p>
            {categoriesInGroup(g.id).map((c) => (
              <label key={c.id} className={row}>
                <input
                  type="checkbox"
                  className={checkbox}
                  checked={filters.cats.includes(c.id)}
                  onChange={() => setFilters((f) => ({ ...f, cats: toggle(f.cats, c.id) }))}
                />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-forest-dark/55 tabular-nums">{counts[c.id] ?? 0}</span>
              </label>
            ))}
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend className={h}>Availability</legend>
        {(
          [
            ["available", "Available"],
            ["made-to-order", "Made to order"],
          ] as [Availability, string][]
        ).map(([v, label]) => (
          <label key={v} className={row}>
            <input
              type="checkbox"
              className={checkbox}
              checked={filters.avail.includes(v)}
              onChange={() => setFilters((f) => ({ ...f, avail: toggle(f.avail, v) }))}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className={h}>Price (₹)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pmin" className="sr-only">Minimum price</label>
            <input
              id="pmin"
              inputMode="numeric"
              placeholder={`Min ${priceMin}`}
              value={filters.min}
              onChange={(e) => setFilters((f) => ({ ...f, min: e.target.value.replace(/\D/g, "") }))}
              className={numInput}
            />
          </div>
          <div>
            <label htmlFor="pmax" className="sr-only">Maximum price</label>
            <input
              id="pmax"
              inputMode="numeric"
              placeholder={`Max ${priceMax}`}
              value={filters.max}
              onChange={(e) => setFilters((f) => ({ ...f, max: e.target.value.replace(/\D/g, "") }))}
              className={numInput}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            ["Under ₹500", "", "499"],
            ["₹500–₹1,000", "500", "1000"],
            ["Over ₹1,000", "1001", ""],
          ].map(([label, min, max]) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, min, max }))}
              className={cn(
                "px-3 min-h-[36px] text-xs border font-sans transition-colors",
                filters.min === min && filters.max === max
                  ? "bg-forest-dark text-cream border-forest-dark"
                  : "border-forest-dark/30 hover:bg-forest-dark/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-forest-dark/55 font-sans">Demo prices.</p>
      </fieldset>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();
  const { openCustomOrder } = useUI();
  const [catalog, setCatalog] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.products) && d.products.length > 0) {
          setCatalog(d.products);
        }
      })
      .catch(() => {});
  }, []);

  const priceMin = useMemo(() => Math.min(...catalog.map((p) => p.price)), [catalog]);
  const priceMax = useMemo(() => Math.max(...catalog.map((p) => p.price)), [catalog]);

  const initial = useMemo(() => fromParams(new URLSearchParams(paramString)), [paramString]);
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);

  // Re-sync when the user follows a nav / footer / search link while on /shop.
  useEffect(() => {
    setFilters(initial.filters);
    setSort(initial.sort);
  }, [initial]);

  const filtered = useMemo(() => {
    const min = filters.min ? Number(filters.min) : 0;
    const max = filters.max ? Number(filters.max) : Infinity;
    let list = catalog.filter(
      (p) =>
        (filters.cats.length === 0 || filters.cats.includes(p.category)) &&
        (filters.avail.length === 0 || filters.avail.includes(p.availability)) &&
        p.price >= min &&
        p.price <= max &&
        productMatches(p, filters.q)
    );
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return Number(!!b.isNew) - Number(!!a.isNew) || b.order - a.order;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return Number(!!b.isFeatured) - Number(!!a.isFeatured) || b.order - a.order;
      }
    });
    return list;
  }, [catalog, filters, sort]);

  // Counts reflect the other active filters so numbers always add up.
  const counts = useMemo(() => {
    const min = filters.min ? Number(filters.min) : 0;
    const max = filters.max ? Number(filters.max) : Infinity;
    const out: Record<string, number> = {};
    catalog.forEach((p) => {
      if (
        (filters.avail.length === 0 || filters.avail.includes(p.availability)) &&
        p.price >= min &&
        p.price <= max &&
        productMatches(p, filters.q)
      )
        out[p.category] = (out[p.category] ?? 0) + 1;
    });
    return out;
  }, [catalog, filters]);

  const activeCount =
    filters.cats.length + filters.avail.length + (filters.min || filters.max ? 1 : 0) + (filters.q ? 1 : 0);
  const clear = () => setFilters(emptyFilters);

  const title =
    filters.cats.length === 1
      ? CATEGORIES.find((c) => c.id === filters.cats[0])?.name
      : "The collection";

  const chips: { label: string; remove: () => void }[] = [
    ...filters.cats.map((id) => ({
      label: CATEGORIES.find((c) => c.id === id)!.name,
      remove: () => setFilters((f) => ({ ...f, cats: f.cats.filter((c) => c !== id) })),
    })),
    ...filters.avail.map((a) => ({
      label: a === "available" ? "Available" : "Made to order",
      remove: () => setFilters((f) => ({ ...f, avail: f.avail.filter((x) => x !== a) })),
    })),
    ...(filters.min || filters.max
      ? [{ label: `₹${filters.min || PRICE_MIN}–₹${filters.max || PRICE_MAX}`, remove: () => setFilters((f) => ({ ...f, min: "", max: "" })) }]
      : []),
    ...(filters.q ? [{ label: `“${filters.q}”`, remove: () => setFilters((f) => ({ ...f, q: "" })) }] : []),
  ];

  return (
    <>
      {/* Page banner */}
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-12 sm:py-16`}>
          <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-5 font-sans">
            <Link href="/" className="hover:text-gold">Home</Link> <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">Shop</span>
          </nav>
          <h1 className="font-serif font-normal display-lg">{title}</h1>
          <p className="mt-4 max-w-xl text-base text-ivory/80 font-sans leading-relaxed">
            Handmade keychains, pipe cleaner creations and paintings. Listings are demonstration data until real products are added.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-10 sm:py-14">
        <div className={`${container} grid lg:grid-cols-[280px_1fr] gap-10 xl:gap-14`}>
          {/* Desktop filters */}
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl">Filters</h2>
                {activeCount > 0 && (
                  <button onClick={clear} className="text-xs uppercase tracking-[0.14em] underline underline-offset-[5px] decoration-gold min-h-[44px]">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel filters={filters} setFilters={setFilters} counts={counts} priceMin={priceMin} priceMax={priceMax} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-forest-dark/20">
              <button
                onClick={() => setDrawer(true)}
                className="lg:hidden inline-flex items-center gap-2 min-h-[46px] px-4 border border-forest-dark/50 text-xs uppercase tracking-[0.16em]"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters{activeCount > 0 && ` (${activeCount})`}
              </button>

              <p className="text-sm font-sans text-forest-dark/80 mr-auto" aria-live="polite">
                Showing <strong>{filtered.length}</strong> of {catalog.length} products
              </p>

              <label className="flex items-center gap-2 text-sm font-sans">
                <span className="hidden sm:inline text-forest-dark/70">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="min-h-[46px] px-3 bg-white border border-forest-dark/40 text-[15px] focus:outline-none focus:border-forest-dark"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>

              <div className="hidden sm:flex border border-forest-dark/40" role="group" aria-label="View">
                {(
                  [
                    ["grid", LayoutGrid, "Grid view"],
                    ["list", List, "List view"],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={label}
                    className={cn(
                      "w-[46px] h-[46px] flex items-center justify-center transition-colors",
                      view === v ? "bg-forest-dark text-cream" : "hover:bg-forest-dark/10"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 py-4">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    onClick={c.remove}
                    className="inline-flex items-center gap-2 min-h-[36px] pl-3 pr-2 bg-forest-dark text-cream text-xs font-sans"
                    aria-label={`Remove filter ${c.label}`}
                  >
                    {c.label} <X className="w-3.5 h-3.5" />
                  </button>
                ))}
                <button onClick={clear} className="text-xs uppercase tracking-[0.14em] underline underline-offset-[5px] decoration-gold min-h-[36px] ml-1">
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-6">
              {filtered.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-forest-dark/30">
                  <h2 className="font-serif text-3xl mb-2">No products match</h2>
                  <p className="text-sm text-forest-dark/70 font-sans mb-6 max-w-sm mx-auto leading-relaxed">
                    Try removing a filter — or tell us what you’re looking for and we can make it.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="solid" onClick={clear}>Clear filters</Button>
                    <Button variant="line" onClick={() => openCustomOrder()}>Request a custom order</Button>
                  </div>
                </div>
              ) : (
                <ProductGrid products={filtered} columns={3} layout={view} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile / tablet filter drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Filters"
        subtitle={`${filtered.length} products`}
        icon={<SlidersHorizontal className="w-5 h-5 text-gold-800" />}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="line" onClick={clear} disabled={activeCount === 0}>Clear</Button>
            <Button variant="solid" onClick={() => setDrawer(false)}>Show {filtered.length}</Button>
          </div>
        }
      >
        <div className="px-5 sm:px-6 py-6">
          <FilterPanel filters={filters} setFilters={setFilters} counts={counts} priceMin={priceMin} priceMax={priceMax} />
        </div>
      </Drawer>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-serif text-xl">Loading the collection…</div>}>
      <ShopContent />
    </Suspense>
  );
}
