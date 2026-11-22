import { CATEGORIES, categoriesInGroup } from "@/data/categories";

export const INSTAGRAM_URL = "https://www.instagram.com/eraya_sm/";
export const INSTAGRAM_HANDLE = "@eraya_sm";
/** Set NEXT_PUBLIC_CONTACT_EMAIL in environment variables when ready. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export const catHref = (id: string) => `/shop?category=${id}`;
export const groupHref = (id: string) => `/shop?group=${id}`;

export type NavItem =
  | { label: string; href: string; kind: "link" }
  | { label: string; href: string; kind: "mega"; menu: "shop" | "pipe" };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", kind: "link" },
  { label: "Shop", href: "/shop", kind: "mega", menu: "shop" },
  { label: "Clay Keychains", href: catHref("clay-keychains"), kind: "link" },
  { label: "Crochet Keychains", href: catHref("crochet-keychains"), kind: "link" },
  { label: "Pipe Cleaner Creations", href: groupHref("pipe-cleaner"), kind: "mega", menu: "pipe" },
  { label: "Paintings", href: catHref("paintings"), kind: "link" },
  { label: "Our Story", href: "/about", kind: "link" },
  { label: "Custom Orders", href: "/#custom-orders", kind: "link" },
];

export const PIPE_CLEANER_CATEGORIES = categoriesInGroup("pipe-cleaner");
export { CATEGORIES };
