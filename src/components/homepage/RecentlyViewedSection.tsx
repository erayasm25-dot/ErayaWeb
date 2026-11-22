"use client";

import React from "react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { container } from "@/lib/utils";

/** Renders nothing until the visitor has viewed at least one product. */
export default function RecentlyViewedSection({ excludeId, theme = "light" }: { excludeId?: string; theme?: "light" | "dark" }) {
  const { recent, clear } = useRecentlyViewed();
  const items = recent.filter((p) => p.id !== excludeId).slice(0, 4);
  if (items.length === 0) return null;
  const dark = theme === "dark";

  return (
    <section className={dark ? "bg-forest-dark text-cream py-14 sm:py-20" : "bg-ivory text-forest-dark py-14 sm:py-20"} aria-labelledby="recent-heading">
      <div className={container}>
        <div className="flex items-end justify-between gap-6 mb-8">
          <SectionHeading theme={theme} eyebrow="Pick up where you left off" title={<span id="recent-heading">Recently viewed</span>} />
          <button onClick={clear} className="text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px] shrink-0">
            Clear
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} aspect="square" />
          ))}
        </div>
      </div>
    </section>
  );
}
