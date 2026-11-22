# ERAYA — Premium Handmade Crafts Boutique
> *"Little things, lovingly handmade."*

Official Instagram: [@eraya_sm](https://www.instagram.com/eraya_sm/)

---

## 🌿 Brand Overview

**ERAYA** is a luxury independent handmade boutique offering thoughtfully crafted keepsakes:
- **Clay Keychains** (oven-hardened, hand-sculpted polymer clay)
- **Crochet Keychains & Charms** (fine mercerized cotton yarn, hand-stitched)
- **Pipe Cleaner Flowers & Bouquets** (everlasting plush velvet blooms)
- **Pipe Cleaner Ambient Lamps & Festive Diyas** (warm glowing handcrafted luminaries)
- **Pipe Cleaner Lanterns** (sculptural woven light structures)
- **Handmade Paintings** (original gouache and watercolor miniatures)

---

## 🎨 Visual Identity & Design System

- **Primary**: Deep Forest Green (`#183A2B`)
- **Secondary**: Warm Ivory (`#F5F0E6`)
- **Accent**: Champagne Beige (`#DCCBA9`)
- **Additional**: Muted Sage (`#A8B5A0`)
- **Text**: Charcoal (`#292B27`)
- **Background**: Soft Warm Cream (`#FAF7F2`)
- **Typography**:
  - Headings: **Cormorant Garamond** (Editorial serif)
  - Body: **DM Sans** (Clean modern sans-serif)

---

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Interactions & Motion**: Framer Motion (with `prefers-reduced-motion` support)
- **Icons**: Lucide React
- **Architecture**: Modular components, React Context state (`CartContext`, `WishlistContext`, `UIContext`), local storage persistence, responsive mobile-first layouts.

---

## 📂 Architecture

```
eraya/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with fonts, providers, global drawers
│   │   ├── page.tsx           # Complete 12-section Editorial Homepage
│   │   ├── globals.css        # Tailwind directives, webfonts & design tokens
│   │   ├── shop/page.tsx      # Catalogue with category filter and price sort
│   │   ├── about/page.tsx     # Our Story & artisan philosophy
│   │   └── contact/page.tsx   # Studio contact & direct message form
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx   # Section A: Rotating top promo bar
│   │   │   ├── Header.tsx            # Section B: Sticky luxury navigation
│   │   │   ├── Footer.tsx            # Section L: Deep Forest Green footer
│   │   │   ├── CartDrawer.tsx        # Slide-over bag with quantity & demo checkout
│   │   │   ├── WishlistDrawer.tsx    # Slide-over saved favorites with "Move to Bag"
│   │   │   ├── SearchModal.tsx       # Live search overlay with instant filter & tags
│   │   │   ├── QuickViewModal.tsx    # Product preview with image gallery & specs
│   │   │   ├── CustomOrderModal.tsx  # Bespoke craft request form
│   │   │   └── Toast.tsx             # Floating notification pill
│   │   ├── navigation/
│   │   │   └── MobileMenu.tsx        # Full-height mobile slide navigation
│   │   ├── homepage/
│   │   │   ├── HeroSection.tsx       # Section C: Editorial hero
│   │   │   ├── CategorySection.tsx   # Section D: "Explore Our Little World"
│   │   │   ├── NewArrivalsSection.tsx# Section E: "Freshly Made" grid
│   │   │   ├── BestsellersSection.tsx# Section F: "Loved a Little More" showcase
│   │   │   ├── AboutBrandSection.tsx # Section G: "More Than Just Handmade"
│   │   │   ├── CraftSection.tsx      # Section H: "Made Slowly. Loved Forever."
│   │   │   ├── CustomOrdersSection.tsx# Section I: "Dream It. We'll Make It."
│   │   │   ├── InstagramSection.tsx  # Section J: "A Little More of ERAYA"
│   │   │   └── TestimonialsSection.tsx# Section K: Labeled prototype review cards
│   │   ├── products/
│   │   │   ├── ProductCard.tsx       # Interactive card with wishlist, quickview, add
│   │   │   └── ProductGrid.tsx       # Staggered responsive grid
│   │   ├── common/
│   │   │   ├── Button.tsx            # Luxury button variants
│   │   │   ├── Badge.tsx             # Editorial status tags
│   │   │   └── SectionHeading.tsx    # Standardized section headings
│   │   └── animations/
│   │       └── MotionWrapper.tsx     # Viewport scroll transitions
│   ├── context/
│   │   ├── CartContext.tsx           # Global bag state & persistence
│   │   ├── WishlistContext.tsx       # Global wishlist state & persistence
│   │   └── UIContext.tsx             # Modals & toast triggers
│   ├── data/
│   │   ├── categories.ts             # 6 craft categories with imagery
│   │   └── mock-products.ts          # Structured demonstration products
│   ├── types/
│   │   └── product.ts                # TypeScript interfaces
│   └── lib/
│       └── utils.ts                  # Price formatters & class merger
└── tailwind.config.ts
```

---

## 🛠️ How to Run

### Development Mode
```bash
# From workspace root
npm run dev

# Or directly inside the eraya folder
cd eraya
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Start
```bash
cd eraya
npm run build
npm run start
```
