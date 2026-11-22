"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ChevronDown, Palette, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { formatPrice, container, cn } from "@/lib/utils";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import SectionHeading from "@/components/common/SectionHeading";
import QuantityStepper from "@/components/common/QuantityStepper";
import ProductGallery from "@/components/products/ProductGallery";
import ProductCard, { availabilityLabel } from "@/components/products/ProductCard";
import RecentlyViewedSection from "@/components/homepage/RecentlyViewedSection";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-forest-dark/20">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between min-h-[56px] text-left font-serif text-xl"
      >
        {title}
        <ChevronDown className={cn("w-5 h-5 text-gold-800 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-5 text-[15px] leading-relaxed font-sans text-forest-dark/80">{children}</div>}
    </div>
  );
}

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast, openCustomOrder } = useUI();
  const { track } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    track(product.id);
    setQuantity(1);
    setAdded(false);
  }, [product.id, track]);

  const isFavorite = isInWishlist(product.id);

  const add = () => {
    addToCart(product, quantity, false);
    showToast(`Added ${quantity} × “${product.name}” to your bag`);
    setAdded(true);
  };

  return (
    <>
      <section className="bg-ivory text-forest-dark py-8 sm:py-12">
        <div className={container}>
          <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.18em] uppercase text-forest-dark/60 mb-8 font-sans flex flex-wrap gap-x-2">
            <Link href="/" className="hover:text-forest">Home</Link> <span aria-hidden="true">/</span>
            <Link href="/shop" className="hover:text-forest">Shop</Link> <span aria-hidden="true">/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-forest">{product.categoryName}</Link> <span aria-hidden="true">/</span>
            <span className="text-forest-dark" aria-current="page">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <ProductGallery product={product} sizes="(max-width: 1024px) 100vw, 55vw" />
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline-dark">{product.categoryName}</Badge>
                {product.isNew && <Badge variant="forest">New</Badge>}
                {product.isDemo && <Badge variant="outline-dark">Demo listing</Badge>}
              </div>
              <h1 className="font-serif font-normal display-md">{product.name}</h1>

              <p className="mt-5 flex items-baseline gap-3">
                <span className="font-serif text-4xl">{formatPrice(product.price)}</span>
                {product.isDemo && <span className="text-xs text-forest-dark/60 font-sans">Demo price</span>}
              </p>
              <p className="mt-3 text-sm font-sans flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", product.availability === "available" ? "bg-sage-800" : "bg-gold-700")} aria-hidden="true" />
                {availabilityLabel(product)}
              </p>

              <p className="mt-6 text-base leading-relaxed font-sans text-forest-dark/85">{product.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuantityStepper value={quantity} onChange={setQuantity} />
                <Button variant="solid" size="lg" className="flex-1 min-w-[180px]" onClick={add}>
                  {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  {added ? "Added to cart" : "Add to cart"}
                </Button>
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    showToast(isFavorite ? "Removed from wishlist" : "Saved to wishlist");
                  }}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
                  className={cn(
                    "w-[54px] h-[54px] flex items-center justify-center border transition-colors",
                    isFavorite ? "bg-forest-dark text-cream border-forest-dark" : "border-forest-dark/50 hover:bg-forest-dark hover:text-cream"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isFavorite && "fill-cream")} />
                </button>
              </div>
              {added && (
                <button onClick={openCart} className="mt-3 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]">
                  View cart &amp; checkout
                </button>
              )}

              {product.customisable && (
                <div className="mt-8 p-5 border border-gold bg-ivory-300/60 flex gap-4">
                  <Palette className="w-6 h-6 text-forest shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-serif text-xl">Want it your way?</h2>
                    <p className="text-sm text-forest-dark/80 font-sans mt-1 leading-relaxed">
                      Custom versions can be requested. Send an enquiry about this piece.
                    </p>
                    <button
                      onClick={() => openCustomOrder(product.category)}
                      className="mt-3 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]"
                    >
                      Request a custom version
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 border-t border-forest-dark/20">
                <Accordion title="Details" defaultOpen>
                  <p>{product.description}</p>
                </Accordion>
                <Accordion title="Materials">
                  {product.materials.length > 0 ? (
                    <ul className="list-disc pl-5">{product.materials.map((m) => <li key={m}>{m}</li>)}</ul>
                  ) : (
                    <p>Materials will be listed here once confirmed by ERAYA.</p>
                  )}
                </Accordion>
                <Accordion title="Shipping & pickup">
                  <p>
                    Shipping and pickup details haven’t been published yet. See <Link href="/policies#shipping" className="underline decoration-gold underline-offset-4">Shipping &amp; pickup</Link>.
                  </p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest text-cream py-14 sm:py-20 border-t border-gold/30" aria-labelledby="related-heading">
        <div className={container}>
          <SectionHeading eyebrow="You may also like" title={<span id="related-heading">More from ERAYA</span>} className="mb-10" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} aspect="square" className="bg-forest-dark" />
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewedSection excludeId={product.id} />
    </>
  );
}
