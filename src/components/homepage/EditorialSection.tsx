import React from "react";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import MotionWrapper from "@/components/animations/MotionWrapper";
import Button from "@/components/common/Button";
import { CategoryGlyph, Sprig } from "@/components/common/ProductImage";
import { container } from "@/lib/utils";

const PILLARS = [
  { n: "01", title: "Individual", text: "Made by hand, so every piece has a character of its own." },
  { n: "02", title: "Small details", text: "The little touches are what turn an object into a keepsake." },
  { n: "03", title: "Thoughtful gifting", text: "Something small, chosen with care, for someone who matters." },
];

export default function EditorialSection() {
  return (
    <section className="bg-botanical text-cream py-16 sm:py-24 relative overflow-hidden" aria-labelledby="editorial-heading">
      <Sprig className="pointer-events-none absolute -right-6 top-6 h-80 w-auto text-gold/[0.12] rotate-12 hidden md:block" />
      <div className={`${container} relative`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Imagery – asymmetric stack of placeholders */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <MotionWrapper direction="none">
              <div className="grid grid-cols-12 gap-3 sm:gap-4">
                <div
                  className="col-span-7 aspect-[3/4] bg-forest border border-gold/50 flex items-center justify-center text-gold/80"
                  role="img"
                  aria-label="Placeholder artwork: handmade flowers. Photography coming soon."
                >
                  <CategoryGlyph category="flowers" className="w-1/2" />
                </div>
                <div className="col-span-5 flex flex-col gap-3 sm:gap-4 pt-10 sm:pt-16">
                  <div
                    className="aspect-square bg-ivory border border-gold flex items-center justify-center text-forest"
                    role="img"
                    aria-label="Placeholder artwork: handmade crochet keychain"
                  >
                    <CategoryGlyph category="crochet-keychains" className="w-1/2" />
                  </div>
                  <div
                    className="aspect-[4/5] bg-forest-dark border border-gold/50 flex items-center justify-center text-gold/80"
                    role="img"
                    aria-label="Placeholder artwork: handmade lantern"
                  >
                    <CategoryGlyph category="lanterns" className="w-1/2" />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-cream/60">
                Placeholder artwork · studio photography coming soon
              </p>
            </MotionWrapper>
          </div>

          {/* Copy */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <SectionHeading
              eyebrow="Our story"
              title={
                <span id="editorial-heading">
                  Small things can hold
                  <span className="block italic text-cream-400">big feelings.</span>
                </span>
              }
              subtitle="ERAYA is about handmade creativity: pieces shaped, stitched and painted by hand, each with its own charm."
            />

            <ul className="mt-10 border-t border-gold/30">
              {PILLARS.map((p) => (
                <li key={p.n} className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] gap-4 py-5 border-b border-gold/30">
                  <span className="font-serif text-2xl text-gold">{p.n}</span>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm sm:text-base text-ivory/80 font-sans leading-relaxed">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button variant="primary" href="/about">
                Read our story <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
