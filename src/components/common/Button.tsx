"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant =
  | "primary" // cream fill – for dark backgrounds
  | "secondary" // cream outline – for dark backgrounds
  | "outline" // gold outline – for dark backgrounds
  | "solid" // forest fill – for light backgrounds
  | "line" // forest outline – for light backgrounds
  | "ghost"; // underlined text link (dark bg)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  href?: string;
  isExternal?: boolean;
  children: React.ReactNode;
  className?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-[0.14em] uppercase font-sans transition-all duration-200 rounded-none disabled:opacity-50 disabled:cursor-not-allowed text-center whitespace-nowrap";

const sizes = {
  sm: "text-xs px-4 py-2.5 min-h-[42px]",
  md: "text-xs sm:text-[13px] px-6 py-3 min-h-[48px]",
  lg: "text-xs sm:text-[13px] px-8 py-4 min-h-[56px]",
};

const variants: Record<Variant, string> = {
  primary: "bg-cream text-forest-dark border border-cream hover:bg-cream-400 hover:border-cream-400",
  secondary: "bg-transparent text-cream border border-cream/70 hover:bg-cream/10 hover:border-cream",
  outline: "bg-transparent text-cream border border-gold/60 hover:border-gold hover:bg-gold/10",
  solid: "bg-forest text-cream border border-forest hover:bg-forest-dark hover:border-forest-dark",
  line: "bg-transparent text-forest-dark border border-forest-dark/60 hover:bg-forest-dark hover:text-cream",
  ghost: "bg-transparent text-cream underline underline-offset-[6px] decoration-gold/60 hover:decoration-gold px-0",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  isExternal,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(base, variant === "ghost" ? "py-2" : sizes[size], variants[variant], className);

  if (href) {
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
