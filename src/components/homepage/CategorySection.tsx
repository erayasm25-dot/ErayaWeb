import React from "react";
import Link from "next/link";
import SectionHeading from "@/components/common/SectionHeading";
import MotionWrapper from "@/components/animations/MotionWrapper";
import { CategoryGlyph, Sprig } from "@/components/common/ProductImage";
import { CATEGORIES } from "@/data/categories";
import { catHref } from "@/data/navigation";
import { container } from "@/lib/utils";

const TONES = [
  "bg-forest text-gold",
  "bg-botanical text-cream",
  "bg-forest-dark text-gold",
  "bg-forest text-cream",
];

export default function CategorySection() {
  return (
    <section className="bg-ivory text-forest-dark py-16 sm:py-24" aria-labelledby="cat-heading">
      <div className={container}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeading
            theme="light"
            eyebrow="Browse"
            title={<span id="cat-heading">Shop by category</span>}
            subtitle="Eight little worlds, each made by hand."
          />
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.18em] underline underline-offset-[7px] decoration-gold min-h-[44px] inline-flex items-center"
          >
            View everything
          </Link>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-8">
          {CATEGORIES.map((c, i) => (
            <li key={c.id}>
              <MotionWrapper delay={(i % 4) * 0.06}>
                <Link href={catHref(c.id)} className="group flex flex-col items-center text-center">
                  <span className="relative block w-full max-w-[220px] aspect-square">
                    <span
                      className="absolute inset-0 rounded-full border border-gold group-hover:scale-[1.04] transition-transform duration-500"
                      aria-hidden="true"
                    />
                    <span
                      className={`absolute inset-[7px] rounded-full overflow-hidden flex items-center justify-center ${TONES[i % TONES.length]}`}
                      aria-hidden="true"
                    >
                      <Sprig className="absolute -right-2 -bottom-3 h-3/4 w-auto opacity-[0.16] rotate-12" />
                      <CategoryGlyph
                        category={c.id}
                        className="relative w-[46%] transition-transform duration-500 group-hover:scale-110"
                      />
                    </span>
                  </span>
                  <span className="mt-5 font-serif text-xl sm:text-2xl leading-tight group-hover:text-forest transition-colors">
                    {c.name}
                  </span>
                  <span className="mt-1.5 text-[11px] tracking-[0.2em] uppercase text-gold-800 inline-flex items-center gap-2">
                    <span className="h-px w-4 bg-gold-800/60 group-hover:w-8 transition-all duration-300" aria-hidden="true" />
                    Explore
                  </span>
                </Link>
              </MotionWrapper>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
