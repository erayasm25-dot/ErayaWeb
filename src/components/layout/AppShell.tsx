"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { UIProvider } from "@/context/UIContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import WishlistDrawer from "@/components/layout/WishlistDrawer";
import SearchModal from "@/components/layout/SearchModal";
import QuickViewModal from "@/components/layout/QuickViewModal";
import CustomOrderModal from "@/components/layout/CustomOrderModal";
import Toast from "@/components/layout/Toast";
import BackToTop from "@/components/layout/BackToTop";

/** Client shell: providers, global chrome and overlays. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <UIProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-cream focus:text-forest-dark focus:px-4 focus:py-3"
              >
                Skip to content
              </a>
              <AnnouncementBar />
              <Header />
              <main id="main" className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <WishlistDrawer />
              <SearchModal />
              <QuickViewModal />
              <CustomOrderModal />
              <Toast />
              <BackToTop />
            </UIProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </MotionConfig>
  );
}
