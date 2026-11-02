import "server-only";
import { model, models, Schema, type Model } from "mongoose";

// These only protect document saves. The API checks publish rules itself in
// lib/blog.ts, which also covers updates that never run these validators.
function requiredWhenPublished(this: { status?: string }) {
  return this.status === "published";
}

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    /** Old URLs of this post while it was published: they 301 to the current slug. */
    previousSlugs: { type: [String], default: [], index: true },
    category: { type: String, required: requiredWhenPublished, index: true, trim: true },
    excerpt: { type: String, required: requiredWhenPublished, trim: true },
    tldr: { type: String, trim: true },
    keyTakeaways: { type: [String], default: [] },
    author: {
      name: { type: String, required: true, trim: true },
      role: { type: String, trim: true },
    },
    meta: {
      title: { type: String, required: requiredWhenPublished, trim: true },
      description: { type: String, required: requiredWhenPublished, trim: true },
    },
    structuredData: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    /** Only seeded drafts may lack one; the API and admin form always require it. */
    image: { type: String, required: requiredWhenPublished, trim: true },
    alt: { type: String, required: requiredWhenPublished, trim: true },
    content: { type: String, required: requiredWhenPublished },
    faqs: { type: [faqSchema], default: [] },
    tags: { type: [String], default: [] },
    sources: { type: [String], default: [] },
    relatedPostSlugs: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    /** Set the first time the post is published, then kept on later edits. */
    publishedAt: { type: Date },
    readTime: { type: Number, required: true, min: 0 },
    wordCount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const BlogModel = (models.Blog as Model<Record<string, unknown>>) ?? model("Blog", blogSchema);
