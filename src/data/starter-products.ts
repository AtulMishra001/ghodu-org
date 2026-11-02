import type { ProductCategory } from "./categories";

// The starter catalogue: text only, no photos, so server scripts (the seed
// script) can import it. data/products.ts pairs it with bundled photos for
// the site's fallback list.
// TODO: confirm the product list, forms and packing with Ghodu Agro.
// Harvest months are the general Kashmir valley seasons (0 = January).
// localName is the Kashmiri name. TODO: have a native speaker check the spellings.

export type StarterProduct = {
  slug: string;
  name: string;
  localName?: string;
  category: ProductCategory;
  kind: string;
  summary: string;
  harvest: number[];
  forms: string[];
};

export const starterProducts: StarterProduct[] = [
  {
    slug: "walnuts",
    name: "Walnuts",
    localName: "Doon",
    category: "Dry fruits",
    kind: "Tree nut",
    summary: "Orchard walnuts from across the valley, in-shell or as kernels.",
    harvest: [8, 9],
    forms: ["In-shell", "Kernels"],
  },
  {
    slug: "almonds",
    name: "Almonds",
    localName: "Badam",
    category: "Dry fruits",
    kind: "Tree nut",
    summary: "Kashmiri almonds — smaller, oil-rich and naturally sweet.",
    harvest: [6, 7],
    forms: ["In-shell", "Kernels"],
  },
  {
    slug: "saffron",
    name: "Saffron",
    localName: "Kong",
    category: "Crops",
    kind: "Spice",
    summary: "Crimson threads hand-picked from the valley's autumn crocus fields.",
    harvest: [9, 10],
    forms: ["Whole threads"],
  },
  {
    slug: "kashmiri-chilli",
    name: "Kashmiri chilli",
    category: "Crops",
    kind: "Spice",
    summary: "Deep red colour with gentle heat — bought for colour more than fire.",
    harvest: [8, 9],
    forms: ["Whole dried"],
  },
  {
    slug: "apples",
    name: "Apples",
    localName: "Tsoonth",
    category: "Crops",
    kind: "Orchard fruit",
    summary: "Crisp, high-altitude apples from India's largest apple-growing region.",
    harvest: [7, 8, 9, 10],
    forms: ["Fresh"],
  },
  {
    slug: "pears",
    name: "Pears",
    localName: "Tang",
    category: "Crops",
    kind: "Orchard fruit",
    summary: "Juicy valley pears, picked through late summer and early autumn.",
    harvest: [7, 8, 9],
    forms: ["Fresh"],
  },
  {
    slug: "cherries",
    name: "Cherries",
    localName: "Gilaas",
    category: "Crops",
    kind: "Orchard fruit",
    summary: "The valley's first fruit of the year, picked in early summer.",
    harvest: [4, 5],
    forms: ["Fresh"],
  },
];
