"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProductById } from "@/data/mock-products";
import { Product } from "@/types/product";

const KEY = "eraya_recent";
const MAX = 8;

interface RecentContextType {
  recent: Product[];
  track: (productId: string) => void;
  clear: () => void;
}

const RecentContext = createContext<RecentContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setIds((JSON.parse(stored) as string[]).filter((id) => getProductById(id)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const track = useCallback((productId: string) => {
    setIds((prev) =>
      prev[0] === productId
        ? prev
        : [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX)
    );
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const recent = ids.map((id) => getProductById(id)).filter(Boolean) as Product[];

  return (
    <RecentContext.Provider value={{ recent, track, clear }}>
      {children}
    </RecentContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
