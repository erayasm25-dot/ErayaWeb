import React from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
  layout?: "grid" | "list";
  className?: string;
}

export default function ProductGrid({
  products,
  columns = 4,
  layout = "grid",
  className,
}: ProductGridProps) {
  if (layout === "list") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} layout="list" />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-6 lg:gap-7",
        columns === 4 ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3",
        className
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 2} />
      ))}
    </div>
  );
}
