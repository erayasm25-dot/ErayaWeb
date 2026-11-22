"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { CATEGORIES } from "@/data/categories";
import { catHref } from "@/data/navigation";
import { searchCatalog } from "@/lib/search";
import { formatPrice } from "@/lib/utils";
import ProductImage, { CategoryGlyph } from "@/components/common/ProductImage";
import { useOverlay } from "@/hooks/useOverlay";

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUI();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useOverlay(isSearchOpen, closeSearch);

  useEffect(() => {
    if (isSearchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [isSearchOpen]);

  const { products, categories } = searchCatalog(query);
  const hasQuery = query.trim().length > 0;
  const nothing = hasQuery && products.length === 0 && categories.length === 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasQuery) return;
    closeSearch();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[8vh] px-3 sm:px-4" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-forest-deep/80"
          />
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-ivory text-forest-dark border border-gold shadow-elevated z-10 max-h-[84vh] flex flex-col"
          >
            <form onSubmit={submit} className="flex items-center gap-3 px-4 sm:px-5 h-16 border-b border-gold/40 shrink-0">
              <Search className="w-5 h-5 text-forest/60 shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clay, crochet, bouquets, lamps…"
                aria-label="Search the collection"
                className="flex-1 min-w-0 bg-transparent text-base text-forest-dark placeholder:text-forest-dark/45 focus:outline-none font-sans"
              />
              <button type="button" onClick={closeSearch} className="w-10 h-10 -mr-2 flex items-center justify-center text-forest-dark/60 hover:text-forest-dark" aria-label="Close search">
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="overflow-y-auto p-4 sm:p-5">
              {!hasQuery && (
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-gold-800 mb-3">Browse categories</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.id}
                        href={catHref(c.id)}
                        onClick={closeSearch}
                        className="px-3 h-10 inline-flex items-center border border-forest-dark/25 hover:bg-forest-dark hover:text-cream text-sm font-sans transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {nothing && (
                <p className="py-8 text-center text-sm text-forest-dark/70 font-sans">
                  Nothing matches “{query}”. Try “keychain”, “bouquet” or “lamp” — or ask for it as a custom order.
                </p>
              )}

              {categories.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-gold-800 mb-2">Categories</p>
                  <ul>
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={catHref(c.id)}
                          onClick={closeSearch}
                          className="flex items-center gap-3 py-2 group"
                        >
                          <span className="w-10 h-10 rounded-full bg-forest text-gold flex items-center justify-center shrink-0">
                            <CategoryGlyph category={c.id} className="w-6 h-6" />
                          </span>
                          <span className="font-serif text-xl flex-1">{c.name}</span>
                          <ArrowRight className="w-4 h-4 text-forest/50 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {products.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-gold-800 mb-2">Products</p>
                  <ul className="divide-y divide-forest-dark/10">
                    {products.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/shop/${p.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3.5 py-2.5 group"
                        >
                          <ProductImage product={p} compact className="w-12 h-14 shrink-0" sizes="48px" />
                          <span className="flex-1 min-w-0">
                            <span className="block font-serif text-lg leading-tight truncate group-hover:text-forest">{p.name}</span>
                            <span className="block text-[11px] uppercase tracking-[0.14em] text-gold-800 mt-0.5">{p.categoryName}</span>
                          </span>
                          <span className="font-serif text-lg shrink-0">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/shop?q=${encodeURIComponent(query.trim())}`}
                    onClick={closeSearch}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-forest-dark underline underline-offset-[6px] decoration-gold min-h-[44px]"
                  >
                    See all results in shop <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
