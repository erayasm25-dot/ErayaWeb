import { Product, ProductCategory, Availability } from "@/types/product";
import { getCategory } from "@/data/categories";

/**
 * INITIAL SEED CATALOGUE (DEMONSTRATION DATA)
 * ---------------------------------------------------------------------------
 * Used to seed the SQLite database on first boot. Owners can edit, replace,
 * or add real products directly from /admin without touching code.
 */

type Seed = {
  category: ProductCategory;
  sku: string;
  label: string;
  price: number;
  availability: Availability;
  stockCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
};

const SEEDS: Seed[] = [
  { category: "clay-keychains", sku: "ERY-CLAY-01", label: "Clay Keychain I", price: 299, availability: "available", stockCount: 3, isNew: true, isBestseller: true },
  { category: "clay-keychains", sku: "ERY-CLAY-02", label: "Clay Keychain II", price: 349, availability: "made-to-order", isFeatured: true },
  { category: "crochet-keychains", sku: "ERY-CROC-01", label: "Crochet Keychain I", price: 349, availability: "available", stockCount: 4, isNew: true, isFeatured: true, isBestseller: true },
  { category: "crochet-keychains", sku: "ERY-CROC-02", label: "Crochet Keychain II", price: 399, availability: "made-to-order" },
  { category: "flowers", sku: "ERY-FLOW-01", label: "Flower Stem I", price: 149, availability: "available", stockCount: 8, isNew: true },
  { category: "flowers", sku: "ERY-FLOW-02", label: "Flower Stem II", price: 199, availability: "available", stockCount: 5 },
  { category: "bouquets", sku: "ERY-BOUQ-01", label: "Bouquet I", price: 799, availability: "made-to-order", isFeatured: true, isBestseller: true },
  { category: "bouquets", sku: "ERY-BOUQ-02", label: "Bouquet II", price: 999, availability: "made-to-order", isNew: true },
  { category: "lamps", sku: "ERY-LAMP-01", label: "Lamp I", price: 1199, availability: "made-to-order", isFeatured: true },
  { category: "lamps", sku: "ERY-LAMP-02", label: "Lamp II", price: 1399, availability: "available", stockCount: 2 },
  { category: "diyas", sku: "ERY-DIYA-01", label: "Diya I", price: 449, availability: "available", stockCount: 6, isNew: true, isBestseller: true },
  { category: "diyas", sku: "ERY-DIYA-02", label: "Diya II", price: 549, availability: "available", stockCount: 4 },
  { category: "lanterns", sku: "ERY-LANT-01", label: "Lantern I", price: 1299, availability: "made-to-order", isFeatured: true },
  { category: "lanterns", sku: "ERY-LANT-02", label: "Lantern II", price: 1499, availability: "available", stockCount: 2 },
  { category: "paintings", sku: "ERY-ART-01", label: "Painting I", price: 1499, availability: "made-to-order", isFeatured: true },
  { category: "paintings", sku: "ERY-ART-02", label: "Painting II", price: 1999, availability: "available", stockCount: 1, isNew: true },
];

const CATEGORY_WORD: Record<ProductCategory, string> = {
  "clay-keychains": "clay keychain",
  "crochet-keychains": "crochet keychain",
  flowers: "pipe cleaner flower",
  bouquets: "pipe cleaner bouquet",
  lamps: "pipe cleaner lamp",
  diyas: "pipe cleaner diya",
  lanterns: "pipe cleaner lantern",
  paintings: "handmade painting",
};

const SINGULAR: Record<ProductCategory, string> = {
  "clay-keychains": "Clay Keychain",
  "crochet-keychains": "Crochet Keychain",
  flowers: "Handmade Flower",
  bouquets: "Bouquet",
  lamps: "Lamp",
  diyas: "Diya",
  lanterns: "Lantern",
  paintings: "Painting",
};

export const MOCK_PRODUCTS: Product[] = SEEDS.map((seed, i) => {
  const cat = getCategory(seed.category)!;
  const slug = `demo-${seed.label.toLowerCase().replace(/\s+/g, "-")}`;
  return {
    id: slug,
    slug,
    sku: seed.sku,
    name: `${SINGULAR[seed.category]} · Demo ${seed.label.split(" ").pop()}`,
    category: seed.category,
    categoryName: cat.name,
    price: seed.price,
    availability: seed.availability,
    stockCount: seed.stockCount ?? null,
    isNew: seed.isNew,
    isFeatured: seed.isFeatured,
    isBestseller: seed.isBestseller,
    isDemo: true,
    images: [],
    description: `Demo listing for a ${CATEGORY_WORD[seed.category]}. Replace with real photographs, pricing, and details from the Owner Dashboard.`,
    materials: [],
    customisable: true,
    tags: [CATEGORY_WORD[seed.category], cat.name.toLowerCase(), "handmade"],
    order: SEEDS.length - i,
  };
});

export const getProductBySlug = (slug: string) =>
  MOCK_PRODUCTS.find((p) => p.slug === slug);
export const getProductById = (id: string) =>
  MOCK_PRODUCTS.find((p) => p.id === id);
export const getRelated = (product: Product, limit = 4) => {
  const same = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  const others = MOCK_PRODUCTS.filter(
    (p) => p.category !== product.category && p.id !== product.id
  );
  return [...same, ...others].slice(0, limit);
};
