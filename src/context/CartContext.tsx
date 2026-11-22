"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "@/types/product";
import { getProductById } from "@/data/mock-products";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  /** Increments on every add – used to animate the header bag badge. */
  bump: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [bump, setBump] = useState(0);

  // Hydrate from localStorage on client mount. Entries are re-resolved against
  // the current catalogue so stale or removed products never reach the UI.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("eraya_cart");
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        const valid = parsed
          .map((item) => {
            const product = getProductById(item.product?.id);
            return product && item.quantity > 0
              ? { product, quantity: Math.min(99, item.quantity) }
              : null;
          })
          .filter(Boolean) as CartItem[];
        setItems(valid);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
    setIsInitialized(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("eraya_cart", JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (product: Product, quantity = 1, openDrawer = true) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setBump((b) => b + 1);
    if (openDrawer) setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        bump,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
