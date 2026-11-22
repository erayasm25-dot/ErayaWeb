import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import MotionWrapper from "@/components/animations/MotionWrapper";
import { CategoryGlyph, Sprig } from "@/components/common/ProductImage";
import { container } from "@/lib/utils";
import { INSTAGRAM_HANDLE } from "@/data/navigation";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-forest-dark text-cream border-b border-gold/30">
      <Sprig className="pointer-events-none absolute -left-6 top-10 h-72 w-auto text-gold/[0.12] -rotate-12 hidden md:block" />
      <Sprig className="pointer-events-none absolute right-[42%] bottom-0 h-56 w-auto text-gold/[0.10] rotate-[20deg] hidden xl:block" />

      <div className={`${container} relative py-12 sm:py-16 lg:py-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-16 items-center">
          {/* ─── Copy ─── */}
          <div className="lg:col-span-6 xl:col-span-6">
            <MotionWrapper delay={0.05}>
              <p className="flex items-center gap-3 text-[11px] sm:text-xs tracking-[0.3em] uppercase text-gold mb-6">
                <span className="h-px w-10 bg-gold/70" aria-hidden="true" />
                Handmade boutique
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.12}>
              <h1 className="font-serif font-normal display-xl text-cream">
                <span className="block">Little Things.</span>
                <span className="block italic text-cream-400">Lovingly Handmade.</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="mt-7 text-base sm:text-lg text-ivory/85 leading-relaxed max-w-md font-sans">
                Thoughtfully crafted pieces that bring a little beauty to everyday moments.
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.28}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="primary" size="lg" href="/shop">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="lg" href="/about">
                  Discover Our Story
                </Button>
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.36}>
              <ul className="mt-12 pt-6 border-t border-gold/30 flex flex-wrap gap-x-8 gap-y-3 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-cream/75">
                <li>Keychains</li>
                <li>Pipe cleaner creations</li>
                <li>Paintings</li>
                <li className="text-gold">{INSTAGRAM_HANDLE}</li>
              </ul>
            </MotionWrapper>
          </div>

          {/* ─── Image composition (grid cells, intentional layering) ─── */}
          <div className="lg:col-span-6">
            <MotionWrapper delay={0.18} direction="none">
              <figure>
                <div className="grid grid-cols-12 grid-rows-[repeat(12,minmax(0,1fr))] aspect-[6/7] sm:aspect-[7/7] lg:aspect-[6/6.6] max-w-[620px] mx-auto lg:ml-auto lg:mr-0 gap-0">
                  {/* Tall arch */}
                  <div
                    className="col-start-4 col-end-13 row-start-1 row-end-11 bg-forest border border-gold/50 rounded-t-[999px] flex items-center justify-center text-gold/80 overflow-hidden relative"
                    role="img"
                    aria-label="Placeholder artwork: handmade bouquet. Product photography coming soon."
                  >
                    <Sprig className="absolute right-4 bottom-0 h-3/4 w-auto text-gold/[0.16]" />
                    <CategoryGlyph category="bouquets" className="relative w-2/5 max-w-[220px]" />
                  </div>
                  {/* Lower-left square */}
                  <div
                    className="col-start-1 col-end-6 row-start-8 row-end-13 bg-ivory border border-gold flex items-center justify-center text-forest relative z-10"
                    role="img"
                    aria-label="Placeholder artwork: handmade diya"
                  >
                    <CategoryGlyph category="diyas" className="w-1/2 max-w-[120px]" />
                  </div>
                  {/* Small circle */}
                  <div
                    className="col-start-10 col-end-13 row-start-9 row-end-13 aspect-square self-end bg-botanical border border-gold rounded-full flex items-center justify-center text-cream/85 relative z-10"
                    role="img"
                    aria-label="Placeholder artwork: handmade keychain"
                  >
                    <CategoryGlyph category="clay-keychains" className="w-1/2" />
                  </div>
                </div>
                <figcaption className="mt-4 text-center lg:text-right text-[11px] tracking-[0.2em] uppercase text-cream/60 font-sans">
                  Placeholder artwork · ERAYA photography coming soon
                </figcaption>
              </figure>
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
