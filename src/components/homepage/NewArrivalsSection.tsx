"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { container } from "@/lib/utils";

export default function NewArrivalsSection({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const items = products.filter((p) => p.isNew);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const arrow =
    "w-12 h-12 flex items-center justify-center border border-gold/50 text-cream hover:bg-cream hover:text-forest-dark hover:border-cream transition-colors";

  return (
    <section className="bg-forest text-cream py-16 sm:py-24 border-y border-gold/25" aria-labelledby="new-heading">
      <div className={container}>
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="New arrivals"
            title={<span id="new-heading">Fresh from the workbench</span>}
            subtitle="Demo listings shown for layout. Real new pieces will appear here as they are added."
          />
          <div className="hidden sm:flex gap-2 shrink-0">
            <button onClick={() => scrollBy(-1)} className={arrow} aria-label="Scroll new arrivals left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scrollBy(1)} className={arrow} aria-label="Scroll new arrivals right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={scroller}
        tabIndex={0}
        aria-label="New arrivals"
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-4 sm:px-6 lg:px-10 xl:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] scroll-px-4"
      >
        {items.map((p) => (
          <li key={p.id} className="snap-start shrink-0 w-[68%] sm:w-[320px] lg:w-[340px]">
            <ProductCard product={p} aspect="tall" className="h-full bg-forest-dark" sizes="340px" />
          </li>
        ))}
      </ul>

      <div className={`${container} mt-10`}>
        <Link href="/shop?sort=newest" className="text-xs uppercase tracking-[0.18em] underline underline-offset-[7px] decoration-gold min-h-[44px] inline-flex items-center">
          View all new arrivals
        </Link>
      </div>
    </section>
  );
}
