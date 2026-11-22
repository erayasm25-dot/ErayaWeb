import React from "react";
import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import Logo from "@/components/common/Logo";
import { CATEGORIES } from "@/data/categories";
import { catHref, INSTAGRAM_URL, INSTAGRAM_HANDLE, CONTACT_EMAIL } from "@/data/navigation";

const heading = "text-xs uppercase tracking-[0.22em] text-gold font-sans mb-5 block font-medium";
const link = "text-[15px] sm:text-base text-ivory/85 hover:text-gold transition-colors inline-block py-1.5 font-sans";

export default function Footer() {
  return (
    <footer className="bg-forest text-ivory border-t border-gold/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-12 pb-14 border-b border-gold/25">
          <div className="lg:col-span-4">
            <div className="h-24 mb-5">
              <Logo />
            </div>
            <p className="font-serif italic text-2xl text-cream leading-snug max-w-xs">
              Little things, lovingly handmade.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 min-h-[44px] px-4 border border-gold/50 hover:border-gold hover:text-gold text-sm font-sans transition-colors"
            >
              <Instagram className="w-4 h-4 text-gold" /> {INSTAGRAM_HANDLE}
            </a>
          </div>

          <nav aria-label="Shop categories" className="lg:col-span-3">
            <span className={heading}>Shop</span>
            <ul>
              <li><Link href="/shop" className={link}>All products</Link></li>
              <li><Link href="/bestsellers" className={link}>Bestsellers</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={catHref(c.id)} className={link}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About ERAYA" className="lg:col-span-2">
            <span className={heading}>About ERAYA</span>
            <ul>
              <li><Link href="/about" className={link}>Our story</Link></li>
              <li><Link href="/#custom-orders" className={link}>Custom orders</Link></li>
              <li><Link href="/track" className={link}>Track order</Link></li>
              <li><Link href="/contact" className={link}>Contact</Link></li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <span className={heading}>Contact &amp; information</span>
            <ul>
              {CONTACT_EMAIL && (
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className={`${link} inline-flex items-center gap-2`}>
                    <Mail className="w-4 h-4 text-gold shrink-0" /> {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={link}>
                  Message us on Instagram
                </a>
              </li>
              <li><Link href="/policies#shipping" className={link}>Shipping &amp; pickup</Link></li>
              <li><Link href="/policies#returns" className={link}>Returns</Link></li>
              <li><Link href="/policies#privacy" className={link}>Privacy</Link></li>
            </ul>
            <p className="mt-3 text-sm text-ivory/65 font-sans leading-relaxed">
              Shipping, pickup and policy details will be published here once confirmed by ERAYA.
            </p>
          </div>
        </div>

        <div className="pt-7 pr-14 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-ivory/65 font-sans">
          <p>© {new Date().getFullYear()} ERAYA. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Little things, lovingly handmade.</span>
            <Link href="/admin" className="text-cream/60 hover:text-gold transition-colors">
              Owner Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
