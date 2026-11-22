"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useUI } from "@/context/UIContext";

export default function Toast() {
  const { toast } = useUI();
  return (
    <div className="fixed bottom-4 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none" aria-live="polite" role="status">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 bg-cream text-forest-dark pl-3 pr-5 py-3 border border-gold shadow-elevated max-w-md"
          >
            <span className="w-6 h-6 shrink-0 rounded-full bg-forest text-cream flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-sans font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
