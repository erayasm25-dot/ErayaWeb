"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, cn } from "@/lib/utils";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import QuantityStepper from "@/components/common/QuantityStepper";
import ProductGallery from "@/components/products/ProductGallery";
import { availabilityLabel } from "@/components/products/ProductCard";
import { useOverlay } from "@/hooks/useOverlay";

export default function QuickViewModal() {
  const { quickViewProduct: product, closeQuickView, showToast } = useUI();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  useOverlay(!!product, closeQuickView);
  useEffect(() => setQuantity(1), [product?.id]);

  const isFavorite = product ? isInWishlist(product.id) : false;

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQuickView}
              className="fixed inset-0 bg-forest-deep/80"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22 }}
              className="relative bg-ivory text-forest-dark w-full max-w-4xl border border-gold shadow-elevated z-10 my-4"
            >
              <button
                onClick={closeQuickView}
                className="absolute top-2 right-2 z-20 w-11 h-11 flex items-center justify-center bg-ivory/90 hover:bg-forest-dark hover:text-cream transition-colors border border-gold/50"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 sm:p-6 bg-ivory-300/60">
                  <ProductGallery product={product} sizes="(max-width: 768px) 100vw, 400px" />
                </div>

                <div className="p-5 sm:p-8 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
                    <Badge variant="outline-dark">{product.categoryName}</Badge>
                    {product.isNew && <Badge variant="forest">New</Badge>}
                    {product.isDemo && <Badge variant="outline-dark">Demo listing</Badge>}
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl leading-tight">{product.name}</h3>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-serif text-3xl">{formatPrice(product.price)}</span>
                    {product.isDemo && <span className="text-xs text-forest-dark/60 font-sans">Demo price</span>}
                  </p>
                  <p className="mt-2 text-sm font-sans text-forest-dark/80 flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", product.availability === "available" ? "bg-sage-800" : "bg-gold-700")} aria-hidden="true" />
                    {availabilityLabel(product)}
                  </p>
                  <p className="mt-5 text-sm leading-relaxed font-sans text-forest-dark/80">{product.description}</p>

                  <div className="mt-auto pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <QuantityStepper value={quantity} onChange={setQuantity} />
                      <Button
                        variant="solid"
                        className="flex-1"
                        onClick={() => {
                          addToCart(product, quantity);
                          showToast(`Added ${quantity} × “${product.name}” to your bag`);
                          closeQuickView();
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to cart
                      </Button>
                      <button
                        onClick={() => {
                          toggleWishlist(product.id);
                          showToast(isFavorite ? "Removed from wishlist" : "Saved to wishlist");
                        }}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
                        className={cn(
                          "w-[46px] h-[46px] shrink-0 flex items-center justify-center border transition-colors",
                          isFavorite ? "bg-forest-dark text-cream border-forest-dark" : "border-forest-dark/40 hover:bg-forest-dark hover:text-cream"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-cream")} />
                      </button>
                    </div>
                    <Link
                      href={`/shop/${product.slug}`}
                      onClick={closeQuickView}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]"
                    >
                      View full details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
