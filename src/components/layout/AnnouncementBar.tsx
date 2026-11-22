"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";

// Only brand statements – no offers, policies or delivery claims.
const MESSAGES = [
  "Little things, lovingly handmade.",
  "Custom orders welcome — tell us your idea.",
  `Follow along on Instagram ${INSTAGRAM_HANDLE}`,
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="bg-forest-deep text-cream border-b border-gold/25">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-9 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline text-[11px] tracking-[0.2em] uppercase text-gold hover:text-cream transition-colors justify-self-start"
        >
          {INSTAGRAM_HANDLE}
        </a>
        <div className="col-start-2 md:col-start-2 text-center overflow-hidden" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-[13px] tracking-[0.04em] font-sans"
            >
              {MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="justify-self-end w-8 h-8 -mr-2 flex items-center justify-center text-cream/70 hover:text-cream"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
