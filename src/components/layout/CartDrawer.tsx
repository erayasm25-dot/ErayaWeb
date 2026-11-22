"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Drawer from "@/components/common/Drawer";
import QuantityStepper from "@/components/common/QuantityStepper";
import ProductImage from "@/components/common/ProductImage";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal } = useCart();

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title="Your Cart"
      subtitle={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      icon={<ShoppingBag className="w-5 h-5 text-gold-800" />}
      footer={
        items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-xl">Subtotal</span>
              <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-forest-dark/70 font-sans leading-relaxed">
              Prices shown are demo prices. Delivery and payment details are not set up yet.
            </p>
            <Button variant="solid" className="w-full" href="/checkout" onClick={closeCart}>
              Continue to checkout
            </Button>
            <button onClick={closeCart} className="w-full min-h-[44px] text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold">
              Continue browsing
            </button>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
          <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mb-5 text-forest/50">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl mb-2">Your cart is empty</h3>
          <p className="text-sm text-forest-dark/70 font-sans mb-6 max-w-xs leading-relaxed">
            Browse the collection and add something handmade.
          </p>
          <Button variant="solid" href="/shop" onClick={closeCart}>Explore the shop</Button>
        </div>
      ) : (
        <ul className="divide-y divide-gold/30">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 px-5 sm:px-6 py-5">
              <Link href={`/shop/${product.slug}`} onClick={closeCart} className="shrink-0" aria-label={`View ${product.name}`}>
                <ProductImage product={product} compact sizes="88px" className="w-[72px] h-24" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/shop/${product.slug}`} onClick={closeCart} className="font-serif text-lg leading-snug hover:text-forest block">
                      {product.name}
                    </Link>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gold-800 mt-0.5">{product.categoryName}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="w-9 h-9 -mr-2 -mt-1 flex items-center justify-center text-forest-dark/60 hover:text-forest-dark"
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <QuantityStepper size="sm" value={quantity} onChange={(n) => updateQuantity(product.id, n)} label={`Quantity of ${product.name}`} />
                  <span className="font-serif text-xl">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
            </li>
          ))}
          <li className="px-5 sm:px-6 py-3">
            <button onClick={clearCart} className="text-xs uppercase tracking-[0.14em] text-forest-dark/70 hover:text-forest-dark underline underline-offset-4 min-h-[44px]">
              Clear cart
            </button>
          </li>
        </ul>
      )}
    </Drawer>
  );
}
