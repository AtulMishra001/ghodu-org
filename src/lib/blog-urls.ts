export { blogPath, archivePath } from "./blog";

const SITE_URL = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(/\/+$/, "");

export const siteUrl = SITE_URL;

/** Absolute URL in the site's one format: no trailing slash (the Next.js default). */
export function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
