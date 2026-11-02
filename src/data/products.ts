import type { Faq } from "@/lib/faq";
import { photos, type Photo } from "./photos";
import type { ProductCategory } from "./categories";
import type { ProductOrdering } from "./ordering";
import { starterProducts } from "./starter-products";

export { productCategories, type ProductCategory } from "./categories";

export type Product = {
  slug: string;
  name: string;
  localName?: string;
  category: ProductCategory;
  /** Finer grouping shown on cards: "Tree nut", "Spice", "Orchard fruit". */
  kind: string;
  summary: string;
  harvest: number[];
  forms: string[];
  /** Cover photo: cards, showcase, first in the gallery. */
  image: Photo;
  /** Longer description for the spec sheet. */
  description?: string;
  /** Quality specs, e.g. { label: "Moisture", value: "Below 8%" }. */
  specs?: { label: string; value: string }[];
  /** From the admin; only loaded for the product's own page. */
  faqs?: Faq[];
  /** Extra photos shown after the cover. */
  gallery?: Photo[];
  ordering?: ProductOrdering;
};

const starterPhotos: Record<string, Photo> = {
  "walnuts": photos.walnuts,
  "almonds": photos.almonds,
  "saffron": photos.saffron,
  "kashmiri-chilli": photos.chilli,
  "apples": photos.apples,
  "pears": photos.pears,
  "cherries": photos.cherries,
};

/** The starter catalogue with bundled photos: the site's fallback before the database has products. */
export const products: Product[] = starterProducts.map((p) => ({ ...p, image: starterPhotos[p.slug] }));
