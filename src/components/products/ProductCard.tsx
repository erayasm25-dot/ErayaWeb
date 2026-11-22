"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import { formatPrice, cn } from "@/lib/utils";
import Badge from "@/components/common/Badge";
import ProductImage from "@/components/common/ProductImage";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: "grid" | "list";
  /** Image aspect for varied merchandising. */
  aspect?: "portrait" | "square" | "tall";
  className?: string;
  sizes?: string;
}

const ASPECT = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  tall: "aspect-[3/4]",
};

export const availabilityLabel = (p: Product) =>
  p.availability === "available" ? "Available" : "Made to order";

export default function ProductCard({
  product,
  priority = false,
  layout = "grid",
  aspect = "portrait",
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView, showToast } = useUI();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const isFavorite = isInWishlist(product.id);
  const href = `/shop/${product.slug}`;

  const handleAdd = () => {
    addToCart(product, 1, false);
    showToast(`Added “${product.name}” to your bag`);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  };

  const handleWish = () => {
    toggleWishlist(product.id);
    showToast(isFavorite ? "Removed from wishlist" : "Saved to wishlist");
  };

  const isList = layout === "list";

  return (
    <article
      className={cn(
        "group relative flex bg-forest text-cream border border-gold/30 hover:border-gold hover:-translate-y-0.5 transition-all duration-300",
        isList ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* Image */}
      <div className={cn("relative shrink-0 overflow-hidden", isList ? "w-36 sm:w-52" : "w-full")}>
        <Link href={href} className="block" aria-label={`View ${product.name}`} tabIndex={-1}>
          <ProductImage
            product={product}
            priority={priority}
            sizes={sizes}
            className={cn(
              "w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]",
              isList ? "h-full min-h-[11rem]" : ASPECT[aspect]
            )}
          />
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNew && <Badge variant="cream">New</Badge>}
          {product.isBestseller && <Badge variant="gold">Bestseller</Badge>}
          {product.isFeatured && !product.isNew && !product.isBestseller && (
            <Badge variant="gold">Featured</Badge>
          )}
        </div>

        <button
          onClick={handleWish}
          className={cn(
            "absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center transition-colors border",
            isFavorite
              ? "bg-cream text-forest-dark border-cream"
              : "bg-forest-dark/85 text-cream hover:text-gold border-gold/40"
          )}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-forest-dark")} />
        </button>

        {!isList && (
          <button
            onClick={() => openQuickView(product)}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 py-2.5 bg-forest-dark/90 text-cream text-[11px] tracking-[0.16em] uppercase translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 focus-visible:translate-y-0 transition-transform duration-300 border-t border-gold/40"
          >
            <Eye className="w-3.5 h-3.5 text-gold" />
            Quick View
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-5 gap-3.5 min-w-0">
        <div>
          <p className="text-xs text-gold uppercase tracking-[0.14em] font-sans mb-1.5">
            {product.categoryName}
          </p>
          <h3 className="font-serif text-xl sm:text-2xl leading-snug text-cream">
            <Link href={href} className="hover:text-cream-400 transition-colors">
              {product.name}
            </Link>
          </h3>
          {isList && (
            <p className="mt-2.5 text-sm sm:text-[15px] text-ivory/80 font-sans leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="mt-2.5 text-xs sm:text-[13px] font-sans text-ivory/75 flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                product.availability === "available" ? "bg-sage" : "bg-gold"
              )}
              aria-hidden="true"
            />
            {availabilityLabel(product)}
            {product.isDemo && <span className="text-cream/55">· Demo</span>}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 pt-3.5 border-t border-gold/25">
          <div>
            <p className="font-serif text-2xl sm:text-[26px] text-cream leading-none">{formatPrice(product.price)}</p>
            {product.isDemo && (
              <p className="text-[11px] text-cream/55 mt-1 font-sans">Demo price</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isList && (
              <button
                onClick={() => openQuickView(product)}
                className="w-10 h-10 flex items-center justify-center border border-gold/40 hover:border-gold text-cream"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="w-4 h-4 text-gold" />
              </button>
            )}
            <button
              onClick={handleAdd}
              className={cn(
                "inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold uppercase tracking-[0.12em] border transition-colors",
                added
                  ? "bg-sage text-forest-dark border-sage"
                  : "bg-cream text-forest-dark border-cream hover:bg-cream-400"
              )}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
              <span>{added ? "Added" : "Add"}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
