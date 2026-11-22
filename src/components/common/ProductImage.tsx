import React from "react";
import Image from "next/image";
import { Product, ProductCategory } from "@/types/product";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Line illustrations – one per category (decorative, aria-hidden)           */
/* -------------------------------------------------------------------------- */

function Glyph({ category }: { category: ProductCategory }) {
  switch (category) {
    case "clay-keychains":
      return (
        <>
          <circle cx="50" cy="16" r="9" />
          <path d="M50 25v12" />
          <path d="M50 37c-18 0-26 14-22 28 4 13 16 19 22 19s18-6 22-19c4-14-4-28-22-28z" />
          <circle cx="50" cy="62" r="5" />
          <path d="M50 52v-3M50 72v3M40 62h-3M60 62h3" />
        </>
      );
    case "crochet-keychains":
      return (
        <>
          <circle cx="50" cy="16" r="9" />
          <path d="M50 25v10" />
          <circle cx="50" cy="62" r="26" />
          <circle cx="50" cy="62" r="19" strokeDasharray="2 3" />
          <circle cx="50" cy="62" r="12" strokeDasharray="2 3" />
          <circle cx="50" cy="62" r="5" />
        </>
      );
    case "flowers":
      return (
        <>
          <path d="M50 46v48" />
          <path d="M50 78c-14 0-20-8-22-16 12-1 20 4 22 16z" />
          <path d="M50 70c12 0 18-7 20-14-11-1-18 4-20 14z" />
          <circle cx="50" cy="30" r="6" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="50" cy="16" rx="6" ry="10" transform={`rotate(${a} 50 30)`} />
          ))}
        </>
      );
    case "bouquets":
      return (
        <>
          <path d="M50 52l-24 42h48z" />
          <path d="M50 52v30M40 66l10 16M60 66L50 82" />
          {[
            [34, 30],
            [50, 22],
            [66, 30],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="4" />
              {[0, 90, 180, 270].map((a) => (
                <ellipse key={a} cx={x} cy={y - 8} rx="4" ry="6" transform={`rotate(${a} ${x} ${y})`} />
              ))}
              <path d={`M${x} ${y + 5}L50 52`} />
            </g>
          ))}
        </>
      );
    case "lamps":
      return (
        <>
          <path d="M32 20h36l10 34H22z" />
          <path d="M50 54v28" />
          <path d="M34 90h32M38 82h24" />
          <path d="M40 30l-4 16M50 28v20M60 30l4 16" strokeDasharray="2 3" />
        </>
      );
    case "diyas":
      return (
        <>
          <path d="M18 56h64c0 18-14 30-32 30S18 74 18 56z" />
          <path d="M34 56c4-6 28-6 32 0" />
          <path d="M50 52c-9-9-9-17 0-30 9 13 9 21 0 30z" />
          <path d="M50 46c-3-4-3-8 0-13 3 5 3 9 0 13z" />
        </>
      );
    case "lanterns":
      return (
        <>
          <path d="M50 4v10" />
          <circle cx="50" cy="18" r="4" />
          <path d="M34 26h32M32 86h36" />
          <path d="M34 26c-12 14-12 46-2 60M66 26c12 14 12 46 2 60" />
          <path d="M50 26v60M42 26c-6 16-6 44 0 60M58 26c6 16 6 44 0 60" />
          <path d="M40 86v6h20v-6" />
        </>
      );
    case "paintings":
      return (
        <>
          <rect x="16" y="18" width="68" height="64" />
          <rect x="23" y="25" width="54" height="50" />
          <circle cx="62" cy="40" r="6" />
          <path d="M23 66l16-18 12 14 8-8 18 18" />
        </>
      );
  }
}

export function CategoryGlyph({
  category,
  className,
}: {
  category: ProductCategory;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <Glyph category={category} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Botanical sprig – decorative motif echoing the logo's leaves               */
/* -------------------------------------------------------------------------- */

export function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M60 196C58 150 62 90 60 8" />
      {[30, 60, 90, 120, 150].map((y, i) => (
        <g key={y}>
          <path d={`M60 ${y + 10}C${40 - i * 2} ${y + 6} ${24} ${y - 8} ${20} ${y - 22}C${40} ${y - 20} ${58} ${y - 6} 60 ${y + 10}z`} />
          <path d={`M60 ${y - 6}C${80 + i * 2} ${y - 10} ${96} ${y - 24} ${100} ${y - 38}C${80} ${y - 36} ${62} ${y - 22} 60 ${y - 6}z`} />
        </g>
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product image – real photo when available, labelled placeholder otherwise  */
/* -------------------------------------------------------------------------- */

const TONES = [
  "bg-forest text-gold/80",
  "bg-botanical text-cream/70",
  "bg-forest-dark text-gold/70",
  "bg-ivory-300 text-forest/60",
];

interface ProductImageProps {
  product: Pick<Product, "name" | "category" | "images">;
  /** Gallery index; placeholders vary their tone per index. */
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Hide the "Demo placeholder" caption (e.g. in tiny thumbnails). */
  compact?: boolean;
}

export default function ProductImage({
  product,
  index = 0,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className,
  compact = false,
}: ProductImageProps) {
  const photo = product.images[index];

  if (photo) {
    return (
      <div className={cn("relative overflow-hidden bg-forest-dark", className)}>
        <Image
          src={photo}
          alt={`${product.name} – photo ${index + 1}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const tone = TONES[index % TONES.length];

  return (
    <div
      role="img"
      aria-label={`${product.name} – demo placeholder, photograph coming soon`}
      className={cn("relative overflow-hidden flex items-center justify-center", tone, className)}
    >
      <Sprig className="absolute -right-3 -bottom-4 h-2/3 w-auto opacity-[0.18] rotate-[14deg]" />
      <CategoryGlyph
        category={product.category}
        className="relative w-1/2 max-w-[160px]"
      />
      {!compact && (
        <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] uppercase tracking-[0.2em] opacity-75 font-sans">
          Demo placeholder
        </span>
      )}
    </div>
  );
}

/** Number of gallery slots: real photos, or three labelled placeholder views. */
export const galleryLength = (p: { images: string[] }) => Math.max(p.images.length, 3);
