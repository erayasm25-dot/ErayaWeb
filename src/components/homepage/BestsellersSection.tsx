import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { container } from "@/lib/utils";

export default function BestsellersSection({ products }: { products: Product[] }) {
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  if (bestsellers.length === 0) return null;

  return (
    <section className="bg-forest-dark text-cream py-16 sm:py-24 border-y border-gold/25" aria-labelledby="bestsellers-heading">
      <div className={container}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="Owner's Picks"
            title={<span id="bestsellers-heading">Bestsellers &amp; favourites</span>}
            subtitle="Pieces designated by the studio as customer favourites across keychains, bouquets, and glowing diyas."
          />
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] underline underline-offset-[7px] decoration-gold min-h-[44px]"
          >
            Explore all pieces <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} aspect="portrait" />
          ))}
        </div>
      </div>
    </section>
  );
}
