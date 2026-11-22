"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Search, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import Logo from "@/components/common/Logo";
import { CATEGORY_GROUPS, categoriesInGroup } from "@/data/categories";
import { catHref, groupHref, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";
import { useOverlay } from "@/hooks/useOverlay";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const row =
  "flex items-center justify-between w-full min-h-[52px] font-serif text-[22px] text-cream border-b border-gold/20";

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { itemCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { openSearch, openCustomOrder } = useUI();
  const [expanded, setExpanded] = useState<string | null>("shop");

  useOverlay(isOpen, onClose);

  const act = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest-deep/80"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-0 left-0 bottom-0 w-[88%] max-w-sm bg-forest-dark border-r border-gold/40 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-[72px] bg-forest border-b border-gold/30 shrink-0">
              <div className="h-12">
                <Logo asLink={false} />
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-cream/80 hover:text-cream"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-2 py-4">
                <button onClick={act(openSearch)} className="flex flex-col items-center gap-1 py-3 border border-gold/30 text-cream text-xs min-h-[64px]">
                  <Search className="w-5 h-5 text-gold" /> Search
                </button>
                <button onClick={act(openWishlist)} className="relative flex flex-col items-center gap-1 py-3 border border-gold/30 text-cream text-xs min-h-[64px]">
                  <Heart className="w-5 h-5 text-gold" /> Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-2 bg-cream text-forest-dark text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button onClick={act(openCart)} className="relative flex flex-col items-center gap-1 py-3 bg-cream text-forest-dark text-xs font-semibold min-h-[64px]">
                  <ShoppingBag className="w-5 h-5" /> Cart
                  {itemCount > 0 && (
                    <span className="absolute top-1.5 right-2 bg-forest-dark text-cream text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>

              <nav aria-label="Mobile">
                <Link href="/" onClick={onClose} className={row}>Home</Link>
                <Link href="/bestsellers" onClick={onClose} className={row}>Bestsellers</Link>

                {/* Keychains dropdown */}
                <button
                  onClick={() => setExpanded(expanded === "keychains" ? null : "keychains")}
                  aria-expanded={expanded === "keychains"}
                  className={row}
                >
                  Keychains
                  <ChevronDown className={cn("w-5 h-5 text-gold transition-transform", expanded === "keychains" && "rotate-180")} />
                </button>
                {expanded === "keychains" && (
                  <div className="py-2 pl-2 space-y-1 border-b border-gold/20">
                    <Link href={groupHref("keychains")} onClick={onClose} className="block py-2 text-[17px] font-serif text-cream/90">
                      All Keychains
                    </Link>
                    {categoriesInGroup("keychains").map((c) => (
                      <Link key={c.id} href={catHref(c.id)} onClick={onClose} className="block py-2 text-[17px] font-serif text-cream/90">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Shop accordion */}
                <button
                  onClick={() => setExpanded(expanded === "shop" ? null : "shop")}
                  aria-expanded={expanded === "shop"}
                  className={row}
                >
                  Shop
                  <ChevronDown className={cn("w-5 h-5 text-gold transition-transform", expanded === "shop" && "rotate-180")} />
                </button>
                {expanded === "shop" && (
                  <div className="py-3 pl-1 space-y-4 border-b border-gold/20">
                    <Link href="/shop" onClick={onClose} className="block text-[13px] tracking-[0.16em] uppercase text-cream/90 py-1.5">
                      Shop all
                    </Link>
                    {CATEGORY_GROUPS.map((g) => (
                      <div key={g.id}>
                        <Link href={groupHref(g.id)} onClick={onClose} className="block text-[11px] tracking-[0.24em] uppercase text-gold py-1.5">
                          {g.label}
                        </Link>
                        <ul>
                          {categoriesInGroup(g.id).map((c) => (
                            <li key={c.id}>
                              <Link href={catHref(c.id)} onClick={onClose} className="block py-2.5 text-[17px] font-serif text-cream/90">
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/about" onClick={onClose} className={row}>Our Story</Link>
                <Link href="/track" onClick={onClose} className={row}>Track Order</Link>
                <button onClick={act(() => openCustomOrder())} className={row}>Custom Orders</button>
                <Link href="/contact" onClick={onClose} className={row}>Contact</Link>
              </nav>
            </div>

            <div className="px-5 py-4 border-t border-gold/30 shrink-0">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cream hover:text-gold min-h-[44px]"
              >
                <Instagram className="w-4 h-4 text-gold" /> {INSTAGRAM_HANDLE}
              </a>
              <p className="text-sm text-cream/70 font-serif italic">Little things, lovingly handmade.</p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
