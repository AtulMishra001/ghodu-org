import "server-only";
import { Types } from "mongoose";
import { SLUG_PATTERN } from "@/lib/blog";
import { connectDB } from "./mongoose";

// Lookups for the proxy, which is the only place a blog URL can still answer
// with a real 301 or 404: the pages stream inside Suspense, so by the time they
// know a slug is missing the 200 has already been sent. Uses the driver directly
// and returns the bare minimum, because it runs on every post request.

export type BlogRoute = { kind: "live" } | { kind: "moved"; slug: string } | { kind: "missing" };

const blogs = async () => (await connectDB()).connection.db!.collection("blogs");

export async function resolveBlogSlug(slug: string): Promise<BlogRoute> {
  if (!SLUG_PATTERN.test(slug)) return { kind: "missing" };
  const rows = await (await blogs())
    .find({ $or: [{ slug }, { previousSlugs: slug }] }, { projection: { slug: 1, status: 1 } })
    .limit(5)
    .toArray();
  // The post that holds this slug now always wins over an old redirect.
  const current = rows.find((r) => r.slug === slug);
  if (current) return current.status === "published" ? { kind: "live" } : { kind: "missing" };
  const moved = rows.find((r) => r.status === "published");
  return moved ? { kind: "moved", slug: moved.slug } : { kind: "missing" };
}

export async function blogIdExists(id: string) {
  if (!Types.ObjectId.isValid(id)) return false;
  return !!(await (await blogs()).findOne({ _id: new Types.ObjectId(id) }, { projection: { _id: 1 } }));
}
