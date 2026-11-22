"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { Sprig } from "@/components/common/ProductImage";
import { useUI } from "@/context/UIContext";
import { container } from "@/lib/utils";

const STEPS = [
  { n: "1", title: "Share your idea", text: "Tell us what you imagine — colours, theme, occasion." },
  { n: "2", title: "Add a reference", text: "Upload an image if you have one that inspires you." },
  { n: "3", title: "Hear back from us", text: "We review your enquiry and reply to discuss it." },
];

export default function CustomOrdersSection() {
  const { openCustomOrder } = useUI();
  return (
    <section id="custom-orders" className="relative overflow-hidden bg-forest-dark text-cream py-16 sm:py-24 border-t border-gold/30" aria-labelledby="custom-heading">
      <Sprig className="pointer-events-none absolute -left-4 bottom-0 h-72 w-auto text-gold/[0.12] -rotate-6 hidden md:block" />
      <div className={`${container} relative`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-gold mb-5">
              <span className="h-px w-8 bg-gold/70" aria-hidden="true" /> Custom orders
            </p>
            <h2 id="custom-heading" className="font-serif font-normal display-lg">
              Dream it.
              <span className="block italic text-cream-400">We’ll make it by hand.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-ivory/85 leading-relaxed max-w-lg font-sans">
              Have something special in mind — a gift, a colour palette, a keepsake? Send an enquiry and we’ll take it from there.
            </p>
            <div className="mt-9">
              <Button variant="primary" size="lg" onClick={() => openCustomOrder()}>
                Start a custom order <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ol className="lg:col-span-6 border-t border-gold/30">
            {STEPS.map((s) => (
              <li key={s.n} className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 border-b border-gold/30">
                <span className="w-11 h-11 rounded-full border border-gold text-gold flex items-center justify-center font-serif text-xl">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-serif text-2xl leading-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm sm:text-base text-ivory/75 leading-relaxed font-sans">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
