import type { MetadataRoute } from "next";
import { getProducts } from "@/data/catalogue";
import { getPublishedBlogs } from "@/data/blog-posts";
import { absoluteUrl, blogPath } from "@/lib/blog-urls";

// Cached and tagged through the data functions, so CMS writes refresh it too.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, products] = await Promise.all([getPublishedBlogs(), getProducts()]);
  const newest = blogs.map((b) => b.updatedAt).sort().at(-1);
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/products") },
    { url: absoluteUrl("/about-us") },
    { url: absoluteUrl("/contact") },
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`) })),
    { url: absoluteUrl("/blogs"), ...(newest ? { lastModified: newest } : {}) },
    ...blogs.map((b) => ({ url: absoluteUrl(blogPath(b.slug)), lastModified: b.updatedAt })),
  ];
}
