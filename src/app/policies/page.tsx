import React from "react";
import Link from "next/link";
import { container } from "@/lib/utils";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";

export default function PoliciesPage() {
  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-12 sm:py-16`}>
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-5 font-sans"
          >
            <Link href="/" className="hover:text-gold">
              Home
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">
              Information &amp; Policies
            </span>
          </nav>
          <h1 className="font-serif font-normal display-lg">Information &amp; policies</h1>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-14 sm:py-20">
        <div className={`${container} max-w-3xl space-y-12`}>
          <div id="shipping" className="scroll-mt-32 pb-8 border-b border-gold/40">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold-800 mb-2">
              Shipping &amp; pickup
            </p>
            <h2 className="font-serif text-3xl mb-3">Shipping &amp; pickup</h2>
            <p className="text-base text-forest-dark/80 font-sans leading-relaxed">
              Shipping options, pickup availability, and dispatch timelines have not been
              published yet. They will appear here once confirmed by ERAYA. For current
              information, please message{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gold underline-offset-4"
              >
                {INSTAGRAM_HANDLE}
              </a>{" "}
              on Instagram.
            </p>
          </div>

          <div id="returns" className="scroll-mt-32 pb-8 border-b border-gold/40">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold-800 mb-2">
              Returns
            </p>
            <h2 className="font-serif text-3xl mb-3">Returns &amp; exchanges</h2>
            <p className="text-base text-forest-dark/80 font-sans leading-relaxed">
              Return and exchange terms have not been published yet and will be added once
              confirmed by ERAYA.
            </p>
          </div>

          <div id="privacy" className="scroll-mt-32">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold-800 mb-2">
              Privacy
            </p>
            <h2 className="font-serif text-3xl mb-3">Privacy</h2>
            <p className="text-base text-forest-dark/80 font-sans leading-relaxed">
              In this phase, your cart, wishlist, and recently viewed items are stored only
              in your browser&apos;s local storage on your device. No account or personal data is
              submitted to a server.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
