import type { NextRequest } from "next/server";
import { blogFailure, jsonError, jsonOk, readJson, unauthorized } from "@/lib/server/api";
import { revalidateBlogPaths } from "@/lib/server/blog-revalidate";
import { createBlog, listBlogs } from "@/lib/server/blogs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const STATUSES: Record<string, string[]> = { all: ["draft", "published"], draft: ["draft"], published: ["published"] };

const positive = (value: string | null, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Public by default: published posts, list fields only. Anything that could
// reveal a draft or a whole document needs an admin session.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const full = params.get("fields") === "full";
  if (status && !STATUSES[status]) return jsonError("Unknown status. Use all, draft or published.", 400);

  const publicRequest = (!status || status === "published") && !full;
  if (!publicRequest) {
    const denied = await unauthorized();
    if (denied) return denied;
  }

  try {
    const result = await listBlogs({
      statuses: STATUSES[status ?? "published"],
      full,
      publicView: publicRequest,
      page: positive(params.get("page"), 1),
      limit: Math.min(positive(params.get("limit"), DEFAULT_LIMIT), MAX_LIMIT),
    });
    return jsonOk({ success: true, ...result });
  } catch (err) {
    return blogFailure(err, "list");
  }
}

export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  const parsed = await readJson(request);
  if (!parsed.ok) return jsonError("The request body must be valid JSON.", 400);
  try {
    const blog = await createBlog(parsed.body);
    revalidateBlogPaths(blog.slug);
    return jsonOk({ success: true, blog }, 201);
  } catch (err) {
    return blogFailure(err, "create");
  }
}
