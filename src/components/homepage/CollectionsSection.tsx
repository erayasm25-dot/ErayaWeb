"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { CATEGORY_GROUPS } from "@/data/categories";
import { groupHref } from "@/data/navigation";
import { container, cn } from "@/lib/utils";

export default function CollectionsSection({ products: allProducts }: { products: Product[] }) {
  const [group, setGroup] = useState(CATEGORY_GROUPS[1].id);
  const products = allProducts.filter((p) => {
    const g = p.category === "clay-keychains" || p.category === "crochet-keychains" ? "keychains" : p.category === "paintings" ? "art" : "pipe-cleaner";
    return g === group;
  }).slice(0, 4);

  return (
    <section className="bg-ivory-300/70 text-forest-dark py-16 sm:py-24" aria-labelledby="coll-heading">
      <div className={container}>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
          <SectionHeading
            theme="light"
            eyebrow="Collections"
            title={<span id="coll-heading">Shop by craft</span>}
          />
          <div role="tablist" aria-label="Collections" className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORY_GROUPS.map((g) => (
              <button
                key={g.id}
                role="tab"
                aria-selected={group === g.id}
                onClick={() => setGroup(g.id)}
                className={cn(
                  "shrink-0 min-h-[46px] px-5 text-xs uppercase tracking-[0.16em] border transition-colors",
                  group === g.id
                    ? "bg-forest-dark text-cream border-forest-dark"
                    : "border-forest-dark/40 hover:bg-forest-dark/10"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} aspect="square" />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={groupHref(group)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] underline underline-offset-[7px] decoration-gold min-h-[44px]"
          >
            View the full collection <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
