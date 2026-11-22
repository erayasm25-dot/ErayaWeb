"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Instagram, Menu, ChevronDown, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUI } from "@/context/UIContext";
import MobileMenu from "@/components/navigation/MobileMenu";
import Logo from "@/components/common/Logo";
import { CategoryGlyph } from "@/components/common/ProductImage";
import { CATEGORIES, CATEGORY_GROUPS, categoriesInGroup } from "@/data/categories";
import { NAV_ITEMS, catHref, groupHref, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";
import { cn } from "@/lib/utils";

type MenuKey = "shop" | "keychains" | "pipe" | null;

function CountBadge({ count, bump }: { count: number; bump?: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={bump}
      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-cream text-forest-dark text-[10px] font-bold rounded-full flex items-center justify-center animate-bump"
    >
      {count}
    </span>
  );
}

function CategoryLink({ id, onClick }: { id: string; onClick: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === id)!;
  return (
    <Link
      href={catHref(cat.id)}
      onClick={onClick}
      className="group flex items-center gap-3 py-2 text-cream/90 hover:text-cream"
    >
      <span className="w-10 h-10 shrink-0 rounded-full border border-gold/40 bg-forest flex items-center justify-center text-gold group-hover:border-gold transition-colors">
        <CategoryGlyph category={cat.id} className="w-6 h-6" />
      </span>
      <span className="font-serif text-lg leading-tight group-hover:text-gold transition-colors">
        {cat.name}
      </span>
    </Link>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const { itemCount, openCart, bump } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { openSearch, openCustomOrder } = useUI();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(null), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (m: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(m);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };
  const closeNow = () => setMenu(null);

  const iconBtn =
    "relative w-11 h-11 flex items-center justify-center text-cream/90 hover:text-gold transition-colors";

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-forest border-b border-gold/40"
        onMouseLeave={scheduleClose}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* ───────── Row 1: search · logo · actions ───────── */}
          <div
            className={cn(
              "grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300",
              isScrolled ? "h-16 lg:h-[72px]" : "h-[72px] lg:h-24"
            )}
          >
            {/* Left */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileOpen(true)}
                className={cn(iconBtn, "lg:hidden -ml-2")}
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={openSearch}
                className={cn(iconBtn, "lg:hidden")}
                aria-label="Search"
              >
                <Search className="w-[22px] h-[22px]" />
              </button>
              <button
                onClick={openSearch}
                className="hidden lg:flex items-center gap-3 h-11 w-full max-w-[300px] px-4 border border-gold/40 hover:border-gold text-cream/70 hover:text-cream text-sm font-sans transition-colors"
                aria-label="Search the collection"
              >
                <Search className="w-4 h-4 text-gold" />
                <span className="truncate">Search handmade pieces</span>
              </button>
            </div>

            {/* Centre – official logo */}
            <div
              className={cn(
                "transition-[height] duration-300",
                isScrolled ? "h-12 lg:h-14" : "h-14 lg:h-20"
              )}
            >
              <Logo priority />
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-0.5 sm:gap-1">
              <Link
                href="/track"
                className="hidden md:inline-flex items-center h-11 px-3 text-[11px] tracking-[0.16em] uppercase text-cream/85 hover:text-gold transition-colors font-sans"
              >
                Track Order
              </Link>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(iconBtn, "hidden sm:flex")}
                aria-label={`ERAYA on Instagram ${INSTAGRAM_HANDLE}`}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <button onClick={openWishlist} className={iconBtn} aria-label={`Wishlist, ${wishlistCount} saved`}>
                <Heart className="w-5 h-5" />
                <CountBadge count={wishlistCount} />
              </button>
              <button onClick={openCart} className={cn(iconBtn, "-mr-2 lg:mr-0")} aria-label={`Shopping cart, ${itemCount} items`}>
                <ShoppingBag className="w-5 h-5" />
                <CountBadge count={itemCount} bump={bump} />
              </button>
            </div>
          </div>

          {/* ───────── Row 2: category navigation (desktop) ───────── */}
          <nav
            aria-label="Main"
            className="hidden lg:flex items-center justify-center gap-x-6 xl:gap-x-8 h-13 py-1 border-t border-gold/20"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/shop"
                  ? pathname.startsWith("/shop")
                  : pathname === item.href;
              const linkCls = cn(
                "relative text-[13px] xl:text-[14px] tracking-[0.11em] uppercase font-sans py-2.5 transition-colors whitespace-nowrap",
                isActive ? "text-gold" : "text-cream/90 hover:text-gold"
              );

              if (item.kind === "mega") {
                const isOpen = menu === item.menu;
                return (
                  <div
                    key={item.label}
                    className="flex items-center"
                    onMouseEnter={() => openMenu(item.menu)}
                  >
                    <Link href={item.href} className={linkCls} onClick={closeNow}>
                      {item.label}
                    </Link>
                    <button
                      onClick={() => setMenu(isOpen ? null : item.menu)}
                      onFocus={() => undefined}
                      aria-expanded={isOpen}
                      aria-controls={`mega-${item.menu}`}
                      aria-label={`${isOpen ? "Close" : "Open"} ${item.label} menu`}
                      className="w-6 h-8 flex items-center justify-center text-cream/70 hover:text-gold"
                    >
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  </div>
                );
              }

              if (item.label === "Custom Orders") {
                return (
                  <button key={item.label} onClick={() => openCustomOrder()} className={linkCls} onMouseEnter={closeNow}>
                    {item.label}
                  </button>
                );
              }

              return (
                <Link key={item.label} href={item.href} className={linkCls} onMouseEnter={closeNow}>
                  {item.label}
                  {isActive && <span className="absolute left-0 right-0 bottom-0 h-px bg-gold" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ───────── Mega menu panels ───────── */}
        {menu && (
          <div
            id={`mega-${menu}`}
            className="hidden lg:block absolute left-0 right-0 top-full bg-forest-dark border-b border-gold/40 shadow-elevated"
            onMouseEnter={() => openMenu(menu)}
          >
            <div className="max-w-[1400px] mx-auto px-10 py-9">
              {menu === "shop" ? (
                <div className="grid grid-cols-12 gap-10">
                  {CATEGORY_GROUPS.map((g) => (
                    <div
                      key={g.id}
                      className={g.id === "pipe-cleaner" ? "col-span-4" : "col-span-2"}
                    >
                      <Link
                        href={groupHref(g.id)}
                        onClick={closeNow}
                        className="text-[11px] tracking-[0.24em] uppercase text-gold hover:text-cream transition-colors block pb-3 mb-2 border-b border-gold/25"
                      >
                        {g.label}
                      </Link>
                      <div className={g.id === "pipe-cleaner" ? "grid grid-cols-2 gap-x-6" : ""}>
                        {categoriesInGroup(g.id).map((c) => (
                          <CategoryLink key={c.id} id={c.id} onClick={closeNow} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="col-span-4 border-l border-gold/25 pl-10 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] tracking-[0.24em] uppercase text-gold mb-3">Made for you</p>
                      <p className="font-serif text-2xl leading-snug text-cream">
                        Have something in mind?
                      </p>
                      <p className="text-sm text-ivory/70 mt-2 font-sans leading-relaxed">
                        Send a custom order enquiry and tell us your idea.
                      </p>
                    </div>
                    <div className="flex items-center gap-6 mt-5">
                      <button
                        onClick={() => {
                          closeNow();
                          openCustomOrder();
                        }}
                        className="text-xs uppercase tracking-[0.16em] text-cream underline underline-offset-[6px] decoration-gold hover:text-gold"
                      >
                        Custom order
                      </button>
                      <Link
                        href="/shop"
                        onClick={closeNow}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-cream hover:text-gold"
                      >
                        Shop all <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : menu === "keychains" ? (
                <div className="grid grid-cols-12 gap-10">
                  <div className="col-span-4">
                    <p className="text-[11px] tracking-[0.24em] uppercase text-gold mb-3">
                      Keychains
                    </p>
                    <p className="font-serif text-3xl leading-tight text-cream">
                      Clay &amp; crochet charms made for everyday bags and keys.
                    </p>
                    <Link
                      href={groupHref("keychains")}
                      onClick={closeNow}
                      className="inline-flex items-center gap-1.5 mt-5 text-xs uppercase tracking-[0.16em] text-cream hover:text-gold"
                    >
                      All Keychains <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="col-span-8 grid grid-cols-3 gap-x-8 items-start">
                    <Link
                      href={groupHref("keychains")}
                      onClick={closeNow}
                      className="group flex items-center gap-3 py-2 text-cream/90 hover:text-cream"
                    >
                      <span className="w-10 h-10 shrink-0 rounded-full border border-gold/40 bg-forest flex items-center justify-center text-gold group-hover:border-gold transition-colors">
                        <CategoryGlyph category="clay-keychains" className="w-6 h-6" />
                      </span>
                      <span className="font-serif text-lg leading-tight group-hover:text-gold transition-colors">
                        All Keychains
                      </span>
                    </Link>
                    {categoriesInGroup("keychains").map((c) => (
                      <CategoryLink key={c.id} id={c.id} onClick={closeNow} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-10">
                  <div className="col-span-4">
                    <p className="text-[11px] tracking-[0.24em] uppercase text-gold mb-3">
                      Pipe Cleaner Creations
                    </p>
                    <p className="font-serif text-3xl leading-tight text-cream">
                      Flowers, bouquets and glowing little pieces.
                    </p>
                    <Link
                      href={groupHref("pipe-cleaner")}
                      onClick={closeNow}
                      className="inline-flex items-center gap-1.5 mt-5 text-xs uppercase tracking-[0.16em] text-cream hover:text-gold"
                    >
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="col-span-8 grid grid-cols-3 gap-x-8">
                    {categoriesInGroup("pipe-cleaner").map((c) => (
                      <CategoryLink key={c.id} id={c.id} onClick={closeNow} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
