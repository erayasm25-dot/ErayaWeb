"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Eye } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard, { availabilityLabel } from "@/components/products/ProductCard";
import ProductImage from "@/components/common/ProductImage";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { container, formatPrice } from "@/lib/utils";

export default function FeaturedSection({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.isFeatured);
  const hero = featured[0];
  const rest = featured.slice(1, 3);
  const { addToCart } = useCart();
  const { showToast, openQuickView } = useUI();

  if (!hero) return null;

  return (
    <section className="bg-ivory text-forest-dark py-16 sm:py-24" aria-labelledby="featured-heading">
      <div className={container}>
        <SectionHeading
          theme="light"
          eyebrow="Featured selection"
          title={<span id="featured-heading">Pieces to start with</span>}
          subtitle="A hand-picked layout preview. These are demo listings until real products are uploaded."
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Large feature */}
          <article className="lg:col-span-7 grid sm:grid-cols-2 bg-forest text-cream border border-gold/40">
            <Link href={`/shop/${hero.slug}`} className="block" aria-label={`View ${hero.name}`} tabIndex={-1}>
              <ProductImage product={hero} priority sizes="(max-width: 640px) 100vw, 30vw" className="w-full h-full min-h-[320px] sm:min-h-[460px]" />
            </Link>
            <div className="p-6 sm:p-8 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge variant="gold">Featured</Badge>
                {hero.isDemo && <Badge variant="outline">Demo listing</Badge>}
              </div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{hero.categoryName}</p>
              <h3 className="font-serif text-3xl sm:text-4xl leading-tight mt-2">
                <Link href={`/shop/${hero.slug}`} className="hover:text-cream-400">{hero.name}</Link>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ivory/80 font-sans">{hero.description}</p>
              <p className="mt-4 text-sm text-ivory/80 font-sans">{availabilityLabel(hero)}</p>
              <p className="mt-6 font-serif text-3xl">{formatPrice(hero.price)}</p>
              <div className="mt-auto pt-6 flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    addToCart(hero, 1, false);
                    showToast(`Added “${hero.name}” to your bag`);
                  }}
                >
                  <ShoppingBag className="w-4 h-4" /> Add to cart
                </Button>
                <div className="flex items-center justify-between">
                  <button onClick={() => openQuickView(hero)} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] min-h-[44px] hover:text-gold">
                    <Eye className="w-4 h-4 text-gold" /> Quick view
                  </button>
                  <Link href={`/shop/${hero.slug}`} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] min-h-[44px] hover:text-gold">
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Two stacked list-style cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
            {rest.map((p) => (
              <ProductCard key={p.id} product={p} layout="list" className="flex-1" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
