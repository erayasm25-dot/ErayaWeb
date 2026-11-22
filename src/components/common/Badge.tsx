import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "cream" | "forest" | "gold" | "outline" | "outline-dark";
  className?: string;
}

const styles = {
  cream: "bg-cream text-forest-dark border border-cream",
  forest: "bg-forest-dark text-cream border border-gold/50",
  gold: "bg-gold text-forest-dark border border-gold",
  outline: "bg-transparent text-cream/90 border border-cream/40",
  "outline-dark": "bg-transparent text-forest-dark/80 border border-forest-dark/30",
};

export default function Badge({ children, variant = "forest", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] text-[10px] font-medium tracking-[0.14em] uppercase font-sans leading-none",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
