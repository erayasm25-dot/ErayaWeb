import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "ERAYA — Little things, lovingly handmade.",
  description:
    "ERAYA is a handmade boutique: clay keychains, crochet keychains, pipe cleaner flowers, bouquets, lamps, diyas and lanterns, and handmade paintings.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "ERAYA — Little things, lovingly handmade.",
    description: "Thoughtfully crafted pieces that bring a little beauty to everyday moments.",
    siteName: "ERAYA",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/images/eraya-logo.png", width: 1024, height: 1024, alt: "ERAYA Handmade logo" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10250F",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-forest-dark text-cream min-h-screen flex flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
