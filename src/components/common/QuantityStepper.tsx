"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

/** Quantity control for light (ivory) surfaces. */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
  className,
}: Props) {
  const btn = cn(
    "flex items-center justify-center text-forest-dark hover:bg-forest-dark hover:text-cream transition-colors disabled:opacity-40 disabled:pointer-events-none",
    size === "md" ? "w-11 h-11" : "w-9 h-9"
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center border border-forest-dark/40 bg-ivory", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={cn("text-center font-sans text-sm font-medium text-forest-dark tabular-nums", size === "md" ? "w-10" : "w-8")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
