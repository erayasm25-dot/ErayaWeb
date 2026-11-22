import React from "react";
import { Instagram, ArrowUpRight } from "lucide-react";
import Button from "@/components/common/Button";
import { container } from "@/lib/utils";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";

export default function InstagramSection() {
  return (
    <section className="bg-forest text-cream py-16 sm:py-20 border-t border-gold/30" aria-labelledby="ig-heading">
      <div className={`${container} flex flex-col items-center text-center`}>
        <Instagram className="w-7 h-7 text-gold mb-5" aria-hidden="true" />
        <h2 id="ig-heading" className="font-serif font-normal display-md">
          Follow along <span className="italic text-cream-400">{INSTAGRAM_HANDLE}</span>
        </h2>
        <p className="mt-4 text-base text-ivory/80 max-w-md font-sans leading-relaxed">
          New pieces, works in progress and everything handmade, on Instagram.
        </p>
        <div className="mt-8">
          <Button variant="primary" size="lg" href={INSTAGRAM_URL} isExternal>
            Visit Instagram <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
