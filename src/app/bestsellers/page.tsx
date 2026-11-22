import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listBestsellersDb } from "@/lib/db";
import ProductGrid from "@/components/products/ProductGrid";
import Button from "@/components/common/Button";
import { container } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bestsellers — ERAYA",
  description: "Curated ERAYA studio favourites across handmade keychains, pipe cleaner creations, and paintings.",
};

export default async function BestsellersPage() {
  const bestsellers = await listBestsellersDb();

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
            <Link href="/shop" className="hover:text-gold">
              Shop
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">
              Bestsellers
            </span>
          </nav>
          <h1 className="font-serif font-normal display-lg">Bestsellers</h1>
          <p className="mt-4 max-w-xl text-base sm:text-lg text-ivory/80 font-sans leading-relaxed">
            Studio favourites curated by ERAYA — handmade pieces loved for gifting and everyday keepsakes.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-12 sm:py-16 min-h-[50vh]">
        <div className={container}>
          {bestsellers.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-forest-dark/30 px-6">
              <h2 className="font-serif text-3xl mb-2">No bestsellers selected yet</h2>
              <p className="text-sm text-forest-dark/70 font-sans mb-6 max-w-md mx-auto">
                Browse the full handmade collection while we update our featured bestsellers.
              </p>
              <Button variant="solid" href="/shop">
                Explore the shop <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-forest-dark/20">
                <p className="text-sm font-sans text-forest-dark/80">
                  Showing <strong>{bestsellers.length}</strong> curated bestseller
                  {bestsellers.length === 1 ? "" : "s"}
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]"
                >
                  Browse full collection <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ProductGrid products={bestsellers} columns={4} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
