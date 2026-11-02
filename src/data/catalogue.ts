import { cacheLife, cacheTag } from "next/cache";
import type { PageFaq } from "@/lib/faq";
import { findPublishedProductBySlug, findPublishedProducts } from "@/lib/server/products";
import { photos, type Photo } from "./photos";
import { productCategories, products, type Product, type ProductCategory } from "./products";

export type CategoryInfo = {
  name: ProductCategory;
  blurb: string;
  image: Photo;
};

/**
 * Published products, in the order set in the admin panel. Cached and tagged
 * "products"; every admin save calls updateTag("products") so changes show
 * on the next request.
 *
 * Until the first product is added in the admin (empty collection), or
 * if the database can't be reached, the site falls back to the starter list
 * in data/products.ts so it never renders empty.
 */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    return (await findPublishedProducts()) ?? products;
  } catch (err) {
    console.error("[catalogue] MongoDB unavailable, showing the starter list:", err instanceof Error ? err.message : err);
    return products;
  }
}

/**
 * One product for its page at /products/[slug], fetched by product ID.
 * Same cache tag as the list, so an admin save refreshes both. Hidden or
 * unknown products return null (the page shows a 404).
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    const found = await findPublishedProductBySlug(slug);
    if (found !== undefined) return found;
  } catch (err) {
    console.error("[catalogue] MongoDB unavailable, using the starter list:", err instanceof Error ? err.message : err);
  }
  return products.find((p) => p.slug === slug) ?? null;
}

/** Other products to suggest on a product page: same line first. */
export async function getRelatedProducts(product: Product, count = 4) {
  const all = (await getProducts()).filter((p) => p.slug !== product.slug);
  const same = all.filter((p) => p.category === product.category);
  return [...same, ...all.filter((p) => p.category !== product.category)].slice(0, count);
}

/** Everything the /products page renders. */
export async function getCatalogue() {
  const list = await getProducts();

  const categories: CategoryInfo[] = productCategories.map((name) => ({ name, ...categoryCopy[name] }));

  return {
    intro: {
      eyebrow: "Catalogue",
      title: "Dry fruits and crops from the Kashmir valley",
      summary:
        "Everything we source and supply in bulk. Filter by line or season, open any product for its spec sheet, and add it to one enquiry.",
    },
    categories,
    products: list,
    // Restates the ordering process from the home page — no invented terms.
    sourcing: {
      title: "Sourcing something that isn't listed?",
      body: "Tell us the product, grade and volume. If it grows in the valley, we'll tell you what's possible this season.",
      notes: ["Grade and packing agreed upfront", "By the kilo or the tonne", "Dispatched on the agreed schedule"],
      image: photos.orchard,
    },
    // Describes how the catalogue works; product terms stay on each product's page.
    faqs: [
      {
        question: "Can I ask about several products in one enquiry?",
        answer: "Yes. Add each product from the catalogue as you browse, then send them together as one enquiry.",
      },
      {
        question: "Where do I find the minimum order, packing and lead time?",
        answer: "On each product's page, under its ordering details. Anything not listed there shows as \"On request\", and we'll confirm it with you.",
      },
      {
        question: "Why aren't prices listed?",
        answer: "Price is confirmed for each order, together with the grade, packing and timing.",
        link: { href: "/contact", label: "Ask for a quote" },
      },
      {
        question: "Can I get a sample first?",
        answer: "Where samples are offered, the terms are on the product's page. If you don't see them, ask in your enquiry.",
      },
      {
        question: "How do I see what's in season?",
        answer: "Turn on \"Harvesting now\" in the catalogue, or open a product to see its harvest months.",
      },
    ] satisfies PageFaq[],
  };
}

const categoryCopy: Record<ProductCategory, Omit<CategoryInfo, "name">> = {
  "Dry fruits": {
    blurb: "Walnuts and almonds from valley orchards, in-shell or as kernels.",
    image: photos.walnuts,
  },
  Crops: {
    blurb: "Saffron, chilli and orchard fruit, bought in step with each harvest.",
    image: photos.saffronField,
  },
};

export type Catalogue = Awaited<ReturnType<typeof getCatalogue>>;
