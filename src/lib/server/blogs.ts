import "server-only";
import { isValidObjectId, Error as MongooseError } from "mongoose";
import { STARTER_BLOG_CATEGORIES } from "@/data/blog";
import { BLOG_ADMIN_LIST_PROJECTION, BLOG_MESSAGES, BLOG_SUMMARY_PROJECTION, countWords, normalizeBlogInput, readTimeFor, validateBlogInput, type Blog, type BlogAdminListItem, type BlogInput, type BlogSummary } from "@/lib/blog";
import { BlogModel } from "@/models/Blog";
import { env } from "./env";
import { connectDB } from "./mongoose";
import { sanitizeArticle } from "./sanitize";

/** A write the caller can fix: the API turns it into a 4xx with this message. */
export class BlogWriteError extends Error {
  constructor(public status: 400 | 404 | 409, message: string) {
    super(message);
  }
}

/** Lean Mongo documents to plain JSON: ObjectIds and Dates become strings. */
const plain = <T>(value: unknown) => JSON.parse(JSON.stringify(value)) as T;

/** Normalises, sanitises and validates a request body. Used by the API and the seed script. */
export function prepareBlog(raw: unknown) {
  const input = normalizeBlogInput(raw);
  input.content = sanitizeArticle(input.content);
  const problem = validateBlogInput(input);
  if (problem) throw new BlogWriteError(400, problem);
  // The site only serves images from its own Cloudinary account (next.config.ts).
  if (!input.image.startsWith(`https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/`)) {
    throw new BlogWriteError(400, "The hero image must be uploaded through the form.");
  }
  return { input, wordCount: countWords(input.content), readTime: readTimeFor(input.content) };
}

/** Reuses an existing category's spelling, so "market insights" doesn't become a second category. */
async function canonicalCategory(category: string) {
  if (!category) return category;
  const known = await listBlogCategories();
  return known.find((c) => c.toLowerCase() === category.toLowerCase()) ?? category;
}

/** A slug now in use can't keep redirecting another post's old URL. */
async function releaseOldSlug(slug: string, ownerId: unknown) {
  await BlogModel.updateMany({ previousSlugs: slug, _id: { $ne: ownerId } }, { $pull: { previousSlugs: slug } });
}

/** Maps database failures on a write to the same clear errors as the checks before it. */
function writeFailure(err: unknown) {
  if ((err as { code?: number }).code === 11000) return new BlogWriteError(409, BLOG_MESSAGES.duplicateSlug);
  if (err instanceof MongooseError.ValidationError || err instanceof MongooseError.CastError) return new BlogWriteError(400, err.message);
  return err;
}

async function assertSlugFree(slug: string, ownId?: string) {
  const taken = await BlogModel.exists(ownId ? { slug, _id: { $ne: ownId } } : { slug });
  if (taken) throw new BlogWriteError(409, BLOG_MESSAGES.duplicateSlug);
}

export async function createBlog(raw: unknown) {
  const { input, wordCount, readTime } = prepareBlog(raw);
  await connectDB();
  try {
    await assertSlugFree(input.slug);
    input.category = await canonicalCategory(input.category);
    const created = await BlogModel.create({
      ...input,
      wordCount,
      readTime,
      publishedAt: input.status === "published" ? new Date() : undefined,
    });
    await releaseOldSlug(input.slug, created._id);
    return plain<Blog>(created.toObject());
  } catch (err) {
    throw writeFailure(err);
  }
}

/** Returns the saved post and every slug whose page has to be refreshed. */
export async function updateBlog(id: string, raw: unknown) {
  if (!isValidObjectId(id)) throw new BlogWriteError(400, "Invalid blog id.");
  const { input, wordCount, readTime } = prepareBlog(raw);
  await connectDB();
  try {
    const doc = await BlogModel.findById(id);
    if (!doc) throw new BlogWriteError(404, "This blog no longer exists.");
    await assertSlugFree(input.slug, id);
    input.category = await canonicalCategory(input.category);

    const before = plain<Blog>(doc.toObject());
    const previous = new Set(before.previousSlugs ?? []);
    // Only a URL that was live needs a redirect; a draft's old slug was never public.
    if (before.status === "published" && before.slug !== input.slug) previous.add(before.slug);
    previous.delete(input.slug);

    doc.set({
      ...input,
      wordCount,
      readTime,
      previousSlugs: [...previous],
      publishedAt: before.publishedAt ?? (input.status === "published" ? new Date() : undefined),
    });
    await doc.save();
    await releaseOldSlug(input.slug, doc._id);
    return { blog: plain<Blog>(doc.toObject()), slugs: [before.slug, input.slug, ...previous] };
  } catch (err) {
    throw writeFailure(err);
  }
}

export async function deleteBlog(id: string) {
  if (!isValidObjectId(id)) throw new BlogWriteError(400, "Invalid blog id.");
  await connectDB();
  const deleted = plain<Blog | null>(await BlogModel.findByIdAndDelete(id).lean());
  if (!deleted) throw new BlogWriteError(404, "This blog was already deleted.");
  return { slugs: [deleted.slug, ...(deleted.previousSlugs ?? [])] };
}

export async function getBlogById(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return plain<Blog | null>(await BlogModel.findById(id).lean());
}

export async function getPublishedBlogBySlug(slug: string) {
  await connectDB();
  return plain<Blog | null>(await BlogModel.findOne({ slug, status: "published" }).lean());
}

/** Newest first: publish date, then last update. */
export async function findPublishedSummaries() {
  await connectDB();
  const rows = await BlogModel.find({ status: "published" }).select(BLOG_SUMMARY_PROJECTION).sort({ publishedAt: -1, updatedAt: -1 }).lean();
  return plain<BlogSummary[]>(rows);
}

/** One page of a list query, for the API. */
export async function listBlogs({ statuses, full, publicView, page, limit }: { statuses: string[]; full: boolean; publicView: boolean; page: number; limit: number }) {
  await connectDB();
  const filter = { status: { $in: statuses } };
  const query = BlogModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit);
  if (!full) query.select(publicView ? BLOG_SUMMARY_PROJECTION : BLOG_ADMIN_LIST_PROJECTION);
  const [rows, total] = await Promise.all([query.lean(), BlogModel.countDocuments(filter)]);
  return { blogs: plain<(BlogAdminListItem | BlogSummary | Blog)[]>(rows), total, page, limit, hasMore: page * limit < total };
}

export async function countBlogs() {
  await connectDB();
  const [total, published] = await Promise.all([BlogModel.countDocuments(), BlogModel.countDocuments({ status: "published" })]);
  return { total, published, drafts: total - published };
}

/** The starter list plus every category editors have used, sorted. */
export async function listBlogCategories() {
  await connectDB();
  const used = (await BlogModel.distinct("category")) as string[];
  const merged = new Map<string, string>();
  for (const c of [...STARTER_BLOG_CATEGORIES, ...used]) if (c) merged.set(c.toLowerCase(), merged.get(c.toLowerCase()) ?? c);
  return [...merged.values()].sort((a, b) => a.localeCompare(b));
}

export type { BlogInput };
