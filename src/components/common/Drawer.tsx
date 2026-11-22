"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useOverlay } from "@/hooks/useOverlay";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Right-hand slide-over on an ivory surface. Used by cart and wishlist. */
export default function Drawer({ open, onClose, title, subtitle, icon, footer, children }: DrawerProps) {
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest-deep/75"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-ivory text-forest-dark flex flex-col border-l border-gold"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 h-[72px] border-b border-gold/40 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {icon}
                <div className="min-w-0">
                  <h2 className="font-serif text-2xl leading-none">{title}</h2>
                  {subtitle && <p className="text-xs text-forest-dark/70 font-sans mt-1">{subtitle}</p>}
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 -mr-2 flex items-center justify-center hover:bg-forest-dark hover:text-cream transition-colors" aria-label={`Close ${title}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-gold/40 px-5 sm:px-6 py-5 shrink-0 bg-ivory-200">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
