import { blogFailure, jsonError, jsonOk, readJson, unauthorized } from "@/lib/server/api";
import { revalidateBlogPaths } from "@/lib/server/blog-revalidate";
import { BlogWriteError, deleteBlog, getBlogById, updateBlog } from "@/lib/server/blogs";

type Context = RouteContext<"/api/blogs/admin/[id]">;

export async function GET(_request: Request, { params }: Context) {
  const denied = await unauthorized();
  if (denied) return denied;
  try {
    const blog = await getBlogById((await params).id);
    return blog ? jsonOk({ success: true, blog }) : jsonError("Blog not found.", 404);
  } catch (err) {
    return blogFailure(err, "admin read");
  }
}

export async function PUT(request: Request, { params }: Context) {
  const denied = await unauthorized();
  if (denied) return denied;
  const parsed = await readJson(request);
  if (!parsed.ok) return jsonError("The request body must be valid JSON.", 400);
  try {
    const { blog, slugs } = await updateBlog((await params).id, parsed.body);
    revalidateBlogPaths(...slugs);
    return jsonOk({ success: true, blog });
  } catch (err) {
    return blogFailure(err, "update");
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await unauthorized();
  if (denied) return denied;
  try {
    const { slugs } = await deleteBlog((await params).id);
    revalidateBlogPaths(...slugs);
    return jsonOk({ success: true });
  } catch (err) {
    if (err instanceof BlogWriteError && err.status === 404) return jsonError(err.message, 404);
    return blogFailure(err, "delete");
  }
}
