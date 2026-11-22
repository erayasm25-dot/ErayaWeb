"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { Product } from "@/types/product";

interface UIContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  isCustomOrderOpen: boolean;
  openCustomOrder: (presetCategory?: string) => void;
  closeCustomOrder: () => void;
  customOrderPreset: string | null;
  toast: string | null;
  showToast: (msg: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customOrderPreset, setCustomOrderPreset] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openQuickView = useCallback((p: Product) => setQuickViewProduct(p), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);
  const openCustomOrder = useCallback((preset?: string) => {
    setCustomOrderPreset(preset ?? null);
    setIsCustomOrderOpen(true);
  }, []);
  const closeCustomOrder = useCallback(() => setIsCustomOrderOpen(false), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isCustomOrderOpen,
        openCustomOrder,
        closeCustomOrder,
        customOrderPreset,
        toast,
        showToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
