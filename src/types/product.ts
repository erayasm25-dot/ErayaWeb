export type ProductCategory =
  | "clay-keychains"
  | "crochet-keychains"
  | "flowers"
  | "bouquets"
  | "lamps"
  | "diyas"
  | "lanterns"
  | "paintings";

export type CategoryGroup = "keychains" | "pipe-cleaner" | "art";

export type Availability = "available" | "made-to-order";

export interface Product {
  id: string;
  /** URL slug */
  slug: string;
  /** Stock keeping unit for order & Google Sheets tracking */
  sku: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  /** Price in INR */
  price: number;
  availability: Availability;
  /** Optional stock count for ready-stock items */
  stockCount?: number | null;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  /** Display order within the Bestsellers collection (lower = earlier) */
  bestsellerOrder?: number;
  /** Explicitly marks demo entries until replaced by owner inventory */
  isDemo: boolean;
  images: string[];
  description: string;
  materials: string[];
  customisable: boolean;
  tags: string[];
  order: number;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  shortName: string;
  group: CategoryGroup;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customNote?: string;
}
