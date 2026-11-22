import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Official ERAYA logo. The artwork is only trimmed of empty margin – never
 * redrawn, stretched or recoloured. Aspect ratio (590 × 420) is preserved.
 */
export default function Logo({
  className,
  priority = false,
  asLink = true,
}: {
  className?: string;
  priority?: boolean;
  asLink?: boolean;
}) {
  const img = (
    <Image
      src="/images/eraya-logo-seamless.png"
      alt="ERAYA Handmade – official logo"
      width={590}
      height={420}
      priority={priority}
      sizes="140px"
      className={cn("h-full w-auto object-contain select-none", className)}
    />
  );
  if (!asLink) return img;
  return (
    <Link href="/" aria-label="ERAYA home" className="inline-block h-full">
      {img}
    </Link>
  );
}
