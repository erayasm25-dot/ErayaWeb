"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { getProductById } from "@/data/mock-products";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/product";
import Button from "@/components/common/Button";
import Drawer from "@/components/common/Drawer";
import ProductImage from "@/components/common/ProductImage";

export default function WishlistDrawer() {
  const { wishlist, isOpen, closeWishlist, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useUI();

  const products = wishlist.map((id) => getProductById(id)).filter(Boolean) as Product[];

  return (
    <Drawer
      open={isOpen}
      onClose={closeWishlist}
      title="Wishlist"
      subtitle={`${wishlistCount} saved`}
      icon={<Heart className="w-5 h-5 text-gold-800" />}
    >
      {products.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
          <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mb-5 text-forest/50">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl mb-2">Nothing saved yet</h3>
          <p className="text-sm text-forest-dark/70 font-sans mb-6 max-w-xs leading-relaxed">
            Tap the heart on any piece to keep it here. Your wishlist is saved on this device.
          </p>
          <Button variant="solid" href="/shop" onClick={closeWishlist}>Explore the shop</Button>
        </div>
      ) : (
        <ul className="divide-y divide-gold/30">
          {products.map((p) => (
            <li key={p.id} className="flex gap-4 px-5 sm:px-6 py-5">
              <Link href={`/shop/${p.slug}`} onClick={closeWishlist} className="shrink-0" aria-label={`View ${p.name}`}>
                <ProductImage product={p} compact sizes="88px" className="w-[72px] h-24" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/shop/${p.slug}`} onClick={closeWishlist} className="font-serif text-lg leading-snug hover:text-forest">
                    {p.name}
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="w-9 h-9 -mr-2 -mt-1 flex items-center justify-center text-forest-dark/60 hover:text-forest-dark shrink-0"
                    aria-label={`Remove ${p.name} from wishlist`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold-800 mt-0.5">{p.categoryName}</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                  <span className="font-serif text-xl">{formatPrice(p.price)}</span>
                  <Button
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      addToCart(p, 1, false);
                      showToast(`Added “${p.name}” to your bag`);
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
