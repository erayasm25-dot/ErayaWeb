import { MOCK_PRODUCTS } from "@/data/mock-products";
import { CATEGORIES } from "@/data/categories";
import { Product, CategoryInfo } from "@/types/product";

export interface SearchResult {
  products: Product[];
  categories: CategoryInfo[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export function productMatches(p: Product, q: string): boolean {
  const query = norm(q);
  if (!query) return true;
  const hay = norm([p.name, p.categoryName, p.tags.join(" "), p.description].join(" "));
  // every word must appear somewhere
  return query.split(" ").every((w) => hay.includes(w));
}

export function searchCatalog(q: string, limit = 6): SearchResult {
  const query = norm(q);
  if (!query) return { products: [], categories: [] };
  const words = query.split(" ");
  const categories = CATEGORIES.filter((c) => {
    const hay = norm(`${c.name} ${c.shortName} ${c.group.replace("-", " ")}`);
    return words.every((w) => hay.includes(w));
  });
  const products = MOCK_PRODUCTS.filter((p) => productMatches(p, q)).slice(0, limit);
  return { products, categories };
}
