import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import Button from "@/components/common/Button";
import { CategoryGlyph, Sprig } from "@/components/common/ProductImage";
import { container } from "@/lib/utils";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";

const VALUES = [
  {
    n: "01",
    title: "Handmade creativity",
    text: "Every piece is shaped, stitched, or painted by hand rather than stamped out on a line.",
  },
  {
    n: "02",
    title: "Individuality",
    text: "Small natural variations give each keychain, bloom, lantern, and painting a character of its own.",
  },
  {
    n: "03",
    title: "Small details",
    text: "From the curve of a petal to the finish of a charm, quiet care goes into the details you notice up close.",
  },
  {
    n: "04",
    title: "Thoughtful gifting",
    text: "Made to be kept on a desk, carried on a bag, or given to someone who appreciates something personal.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30 relative overflow-hidden">
        <Sprig className="pointer-events-none absolute -right-4 top-6 h-72 w-auto text-gold/[0.12] rotate-12 hidden md:block" />
        <div className={`${container} py-12 sm:py-20 relative`}>
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-5 font-sans"
          >
            <Link href="/" className="hover:text-gold">
              Home
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">
              Our Story
            </span>
          </nav>
          <h1 className="font-serif font-normal display-lg max-w-3xl">
            Little things,{" "}
            <span className="italic text-cream-400">lovingly handmade.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-ivory/85 font-sans leading-relaxed">
            ERAYA is an independent handmade boutique creating keychains, pipe
            cleaner flowers, bouquets, lamps, diyas, lanterns, and paintings.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-16 sm:py-24">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="aspect-[4/5] bg-forest text-gold border border-gold/50 flex items-center justify-center"
                  role="img"
                  aria-label="Placeholder artwork: handmade bouquet"
                >
                  <CategoryGlyph category="bouquets" className="w-1/2" />
                </div>
                <div
                  className="aspect-[4/5] bg-botanical text-cream border border-gold/50 flex items-center justify-center mt-8"
                  role="img"
                  aria-label="Placeholder artwork: handmade painting"
                >
                  <CategoryGlyph category="paintings" className="w-1/2" />
                </div>
              </div>
              <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-forest-dark/60 font-sans">
                Placeholder artwork · photography coming soon
              </p>
            </div>

            <div className="lg:col-span-7">
              <SectionHeading
                theme="light"
                eyebrow="What ERAYA stands for"
                title="Small things can hold big feelings."
                subtitle="We believe handmade objects carry a warmth that mass-produced things rarely do. Whether it is a charm for your keys, an everlasting pipe cleaner bouquet, or a small painting for your shelf, each piece is made with care."
              />

              <ul className="mt-10 border-t border-forest-dark/20">
                {VALUES.map((v) => (
                  <li
                    key={v.n}
                    className="grid grid-cols-[3rem_1fr] gap-4 py-5 border-b border-forest-dark/20"
                  >
                    <span className="font-serif text-2xl text-gold-800">{v.n}</span>
                    <div>
                      <h2 className="font-serif text-2xl leading-tight">{v.title}</h2>
                      <p className="mt-1.5 text-sm sm:text-base text-forest-dark/75 font-sans leading-relaxed">
                        {v.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-4">
                <Button variant="solid" size="lg" href="/shop">
                  Explore collection <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="line" size="lg" href={INSTAGRAM_URL} isExternal>
                  Follow {INSTAGRAM_HANDLE}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
