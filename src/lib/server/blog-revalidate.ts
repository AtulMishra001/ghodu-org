import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

/** Cache tag on all public blog data. */
export const BLOGS_TAG = "blogs";

/**
 * Refreshes the archive and each affected post after a CMS write. Pass every
 * slug the write touched: on a rename, that's the old one as well as the new.
 * Blanks and repeats are ignored. `expire: 0` means the next visitor gets fresh
 * data rather than a stale page (updateTag isn't allowed in route handlers).
 */
export function revalidateBlogPaths(...slugs: (string | null | undefined)[]) {
  revalidateTag(BLOGS_TAG, { expire: 0 });
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs.map((s) => s?.trim()).filter(Boolean))) revalidatePath(`/blogs/${slug}`);
}
