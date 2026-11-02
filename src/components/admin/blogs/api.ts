import { BLOG_CONTENT_IMAGE_FOLDER, BLOG_CONTENT_IMAGE_MAX_BYTES, BLOG_HERO_MAX_BYTES, BLOG_IMAGE_FOLDER } from "@/data/blog";
import type { BlogAdminListItem } from "@/lib/blog";
import { IMAGE_MIME } from "@/lib/image-rules";

// Browser calls to the admin APIs. Failures throw with the API's own message.

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(res.status === 401 ? "Your session has ended. Sign in again in another tab, then retry." : (body?.message ?? "The server didn't respond as expected."));
  }
  return body as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Every post: pages through the API until there are none left, so nothing is cut off. */
export async function fetchAllBlogs() {
  const all: BlogAdminListItem[] = [];
  for (let page = 1; ; page++) {
    const res = await request<{ blogs: BlogAdminListItem[]; hasMore: boolean }>(`/api/blogs?status=all&limit=100&page=${page}`);
    all.push(...res.blogs);
    if (!res.hasMore) return all;
  }
}

export const saveBlog = (id: string | undefined, payload: unknown) =>
  id ? request(`/api/blogs/admin/${id}`, json("PUT", payload)) : request("/api/blogs", json("POST", payload));

export const removeBlog = (id: string) => request(`/api/blogs/admin/${id}`, { method: "DELETE" });

const mb = (bytes: number) => `${bytes / 1024 / 1024} MB`;

function fileProblem(file: File, limit: number) {
  if (file.type !== IMAGE_MIME || !/\.webp$/i.test(file.name)) return "Only WebP images are allowed.";
  if (file.size > limit) return `This image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${mb(limit)}.`;
  return null;
}

async function upload(file: File, folder: string, limit: number) {
  const problem = fileProblem(file, limit);
  if (problem) throw new Error(problem);
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  return (await request<{ url: string }>("/api/admin/upload", { method: "POST", body })).url;
}

export const uploadHeroImage = (file: File) => upload(file, BLOG_IMAGE_FOLDER, BLOG_HERO_MAX_BYTES);
export const uploadContentImage = (file: File) => upload(file, BLOG_CONTENT_IMAGE_FOLDER, BLOG_CONTENT_IMAGE_MAX_BYTES);
export const contentImageHint = `WebP only, up to ${mb(BLOG_CONTENT_IMAGE_MAX_BYTES)}.`;
export const heroImageHint = `WebP only, up to ${mb(BLOG_HERO_MAX_BYTES)}.`;
