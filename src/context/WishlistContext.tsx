"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getProductById } from "@/data/mock-products";

interface WishlistContextType {
  wishlist: string[]; // Product IDs
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("eraya_wishlist");
      if (stored) {
        const ids = (JSON.parse(stored) as string[]).filter((id) =>
          getProductById(id)
        );
        setWishlist(ids);
      }
    } catch {
      // Ignore
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("eraya_wishlist", JSON.stringify(wishlist));
    } catch {
      // Ignore
    }
  }, [wishlist, isInitialized]);

  const openWishlist = () => setIsOpen(true);
  const closeWishlist = () => setIsOpen(false);
  const toggleWishlistDrawer = () => setIsOpen((prev) => !prev);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
