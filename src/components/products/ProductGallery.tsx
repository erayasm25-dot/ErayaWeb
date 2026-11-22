"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import ProductImage, { galleryLength } from "@/components/common/ProductImage";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  product,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const [active, setActive] = useState(0);
  const count = galleryLength(product);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ProductImage
        product={product}
        index={active}
        sizes={sizes}
        priority
        className="w-full aspect-[4/5] border border-gold/30"
      />
      <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Product images">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-label={`Show image ${i + 1} of ${count}`}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setActive((active + 1) % count);
              if (e.key === "ArrowLeft") setActive((active - 1 + count) % count);
            }}
            className={cn(
              "relative border transition-all",
              active === i ? "border-forest-dark ring-1 ring-forest-dark" : "border-gold/40 opacity-70 hover:opacity-100"
            )}
          >
            <ProductImage product={product} index={i} compact sizes="120px" className="w-full aspect-square" />
          </button>
        ))}
      </div>
    </div>
  );
}
