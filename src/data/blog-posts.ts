import { cacheLife, cacheTag } from "next/cache";
import { addHeadingIds } from "@/lib/blog-html";
import type { BlogSummary } from "@/lib/blog";
import { BLOGS_TAG } from "@/lib/server/blog-revalidate";
import { findPublishedSummaries, getPublishedBlogBySlug } from "@/lib/server/blogs";
import { articleForDisplay } from "@/lib/server/sanitize";

// Public blog data. Cached for 5 minutes and tagged, so CMS writes also refresh
// it straight away (this project's Cache Components replace `revalidate = 300`).
// A database failure gives an empty result for a few seconds rather than a crash.
const FIVE_MINUTES = { stale: 300, revalidate: 300, expire: 86400 };

export async function getPublishedBlogs(): Promise<BlogSummary[]> {
  "use cache";
  cacheLife(FIVE_MINUTES);
  cacheTag(BLOGS_TAG);
  try {
    return await findPublishedSummaries();
  } catch (err) {
    cacheLife("seconds");
    console.error("[blogs] MongoDB unavailable, showing no posts:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** One published post with its sanitised article HTML and table of contents, or null. */
export async function getPublishedBlogPage(slug: string) {
  "use cache";
  cacheLife(FIVE_MINUTES);
  cacheTag(BLOGS_TAG);
  try {
    const post = await getPublishedBlogBySlug(slug);
    if (!post) return null;
    const { html, toc } = addHeadingIds(articleForDisplay(post.content));
    return { post, html, toc };
  } catch (err) {
    cacheLife("seconds");
    console.error("[blogs] MongoDB unavailable, can't load post:", err instanceof Error ? err.message : err);
    return null;
  }
}
