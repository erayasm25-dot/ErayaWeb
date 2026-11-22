import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  theme?: "dark" | "light";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  theme = "dark",
  className,
}: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <div
      className={cn(
        "flex flex-col max-w-2xl",
        align === "center" ? "text-center mx-auto items-center" : "text-left items-start",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "text-xs sm:text-[13px] tracking-[0.22em] uppercase font-sans font-medium mb-4 flex items-center gap-3",
            dark ? "text-gold" : "text-gold-800"
          )}
        >
          <span className={cn("h-px w-8", dark ? "bg-gold/70" : "bg-gold-800/60")} aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-serif font-normal display-md",
          dark ? "text-cream" : "text-forest-dark"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed font-sans max-w-xl",
            dark ? "text-ivory/85" : "text-forest-dark/80"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
