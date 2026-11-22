import { CategoryInfo, CategoryGroup } from "@/types/product";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "clay-keychains",
    name: "Clay Keychains",
    shortName: "Clay",
    group: "keychains",
    description: "Small handmade clay keychains.",
  },
  {
    id: "crochet-keychains",
    name: "Crochet Keychains",
    shortName: "Crochet",
    group: "keychains",
    description: "Handmade crochet keychains.",
  },
  {
    id: "flowers",
    name: "Handmade Flowers",
    shortName: "Flowers",
    group: "pipe-cleaner",
    description: "Pipe cleaner flowers, made by hand.",
  },
  {
    id: "bouquets",
    name: "Bouquets",
    shortName: "Bouquets",
    group: "pipe-cleaner",
    description: "Pipe cleaner bouquets, made by hand.",
  },
  {
    id: "lamps",
    name: "Lamps",
    shortName: "Lamps",
    group: "pipe-cleaner",
    description: "Pipe cleaner lamps, made by hand.",
  },
  {
    id: "diyas",
    name: "Diyas",
    shortName: "Diyas",
    group: "pipe-cleaner",
    description: "Pipe cleaner diyas, made by hand.",
  },
  {
    id: "lanterns",
    name: "Lanterns",
    shortName: "Lanterns",
    group: "pipe-cleaner",
    description: "Pipe cleaner lanterns, made by hand.",
  },
  {
    id: "paintings",
    name: "Paintings",
    shortName: "Paintings",
    group: "art",
    description: "Handmade paintings.",
  },
];

export const CATEGORY_GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: "keychains", label: "Keychains" },
  { id: "pipe-cleaner", label: "Pipe Cleaner Creations" },
  { id: "art", label: "Art" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const categoriesInGroup = (group: CategoryGroup) =>
  CATEGORIES.filter((c) => c.group === group);
