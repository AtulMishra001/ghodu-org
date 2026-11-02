import { blogFailure, jsonError, jsonOk } from "@/lib/server/api";
import { getPublishedBlogBySlug } from "@/lib/server/blogs";

// Published posts only: a draft's slug answers exactly like one that doesn't exist.
export async function GET(_request: Request, { params }: RouteContext<"/api/blogs/[slug]">) {
  try {
    const blog = await getPublishedBlogBySlug((await params).slug);
    if (!blog) return jsonError("Blog not found.", 404);
    return jsonOk({ success: true, blog: { ...blog, previousSlugs: undefined } });
  } catch (err) {
    return blogFailure(err, "read");
  }
}
