// Blog rules shared by the admin form, the API, the seed script and the public
// pages: field projections and their types, payload normalisation, validation
// and the word-count rules. Client-safe: nothing here touches the server.
import type { Faq } from "./faq";
import { BLOG_AUTHOR } from "@/data/blog";
import { isBlankHtml, htmlToText } from "./rich-text";

export type BlogStatus = "draft" | "published";
export type BlogFaq = Faq;

/** A blog post as it leaves the database (dates are ISO strings). */
export type Blog = {
  _id: string;
  title: string;
  slug: string;
  previousSlugs: string[];
  category: string;
  excerpt: string;
  tldr: string;
  keyTakeaways: string[];
  author: { name: string; role?: string };
  meta: { title: string; description: string };
  structuredData: { title: string; description: string };
  image: string;
  alt: string;
  content: string;
  faqs: BlogFaq[];
  tags: string[];
  sources: string[];
  relatedPostSlugs: string[];
  status: BlogStatus;
  publishedAt?: string;
  readTime: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};

// The two list projections. Each field list drives its type, so the query and
// the type can't drift apart. Neither includes `content` or `faqs`.
const ADMIN_LIST_FIELDS = ["title", "slug", "category", "status", "image", "alt", "updatedAt"] as const;
const SUMMARY_FIELDS = [
  "title", "slug", "category", "excerpt", "image", "alt", "readTime", "meta", "structuredData", "publishedAt", "createdAt", "updatedAt",
] as const;

export const BLOG_ADMIN_LIST_PROJECTION = ADMIN_LIST_FIELDS.join(" ");
export const BLOG_SUMMARY_PROJECTION = SUMMARY_FIELDS.join(" ");

export type BlogAdminListItem = Pick<Blog, "_id" | (typeof ADMIN_LIST_FIELDS)[number]>;
export type BlogSummary = Pick<Blog, "_id" | (typeof SUMMARY_FIELDS)[number]>;

/** What the API accepts, after normalisation. */
export type BlogInput = Pick<
  Blog,
  | "title" | "slug" | "category" | "excerpt" | "tldr" | "keyTakeaways" | "author" | "meta" | "structuredData"
  | "image" | "alt" | "content" | "faqs" | "tags" | "sources" | "relatedPostSlugs" | "status"
>;

export const BLOG_MESSAGES = {
  draft: "Title, slug, and hero image are required to save a draft.",
  publish: "Please complete the required blog fields before publishing.",
  duplicateSlug: "A blog with this slug already exists.",
};

// These sit next to /blogs/[slug] as real routes, so a post can't use them.
const RESERVED_SLUGS = new Set(["page", "category"]);
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lowercase letters, numbers and hyphens. Accents are folded ("Kāshmīr" → "kashmir"). */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "");

/** Accepts an array or a newline-separated string; trims and drops blanks and repeats. */
function list(value: unknown) {
  const items = Array.isArray(value) ? value : typeof value === "string" ? value.split("\n") : [];
  return [...new Set(items.map(text).filter(Boolean))];
}

const record = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {});

/** Turns any request body into a clean BlogInput. Validation happens separately. */
export function normalizeBlogInput(raw: unknown): BlogInput {
  const body = record(raw);
  const meta = record(body.meta);
  const schema = record(body.structuredData);
  const slug = slugify(text(body.slug));
  return {
    title: text(body.title),
    slug,
    category: text(body.category).replace(/\s+/g, " "),
    excerpt: text(body.excerpt),
    tldr: text(body.tldr),
    keyTakeaways: list(body.keyTakeaways),
    // Every post is credited to the locked author, whatever the request says.
    author: { name: BLOG_AUTHOR.name, role: BLOG_AUTHOR.role },
    meta: { title: text(meta.title), description: text(meta.description) },
    structuredData: { title: text(schema.title), description: text(schema.description) },
    image: text(body.image),
    alt: text(body.alt),
    content: typeof body.content === "string" ? body.content : "",
    faqs: (Array.isArray(body.faqs) ? body.faqs : [])
      .map((faq) => ({ question: text(record(faq).question), answer: text(record(faq).answer) }))
      .filter((faq) => faq.question && faq.answer),
    tags: list(body.tags),
    sources: list(body.sources),
    relatedPostSlugs: list(body.relatedPostSlugs).map(slugify).filter((s) => s && s !== slug),
    status: body.status === "published" ? "published" : "draft",
  };
}

const isWebUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** The problem with this post at its status, or null. The same check runs in the form and on the server. */
export function validateBlogInput(input: BlogInput): string | null {
  if (!input.title || !input.slug || !input.image) {
    return input.status === "published" ? BLOG_MESSAGES.publish : BLOG_MESSAGES.draft;
  }
  if (input.status === "published") {
    const required = [
      input.category, input.alt, input.excerpt, input.meta.title, input.meta.description,
      input.structuredData.title, input.structuredData.description,
    ];
    if (required.some((value) => !value) || isBlankHtml(input.content)) return BLOG_MESSAGES.publish;
  }
  if (RESERVED_SLUGS.has(input.slug)) return `"${input.slug}" can't be used as a slug. Choose another.`;
  if (!isWebUrl(input.image)) return "The hero image must be a web address. Upload it again.";
  if (input.category.length > 60) return "Keep the category under 60 characters.";
  const badSource = input.sources.find((source) => !isWebUrl(source));
  if (badSource) return `Sources must be http or https links: "${badSource.slice(0, 80)}".`;
  return null;
}

export function countWords(html: string) {
  const plain = htmlToText(html);
  return plain ? plain.split(" ").length : 0;
}

/** Minutes at 220 words a minute: at least 1 when there is any content, otherwise 0. */
export function readTimeFor(html: string) {
  const words = countWords(html);
  if (words > 0) return Math.max(1, Math.ceil(words / 220));
  return isBlankHtml(html) ? 0 : 1;
}

/** "2 Nov 2026", or the fallback when there's no usable date. Fixed timezone, so server and browser agree. */
export function formatBlogDate(value: string | undefined | null, fallback = "Recently updated") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

export const BLOG_PAGE_SIZE = 6;
export const categorySlug = slugify;

export const blogPath = (slug: string) => `/blogs/${slug}`;

/** The one URL format for archive pages: no trailing slash, and page 1 has no /page/1. */
export function archivePath(page = 1, category?: string) {
  const base = category ? `/blogs/category/${category}` : "/blogs";
  return page > 1 ? `${base}/page/${page}` : base;
}
