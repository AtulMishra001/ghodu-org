import "server-only";
import { isValidObjectId, type Types } from "mongoose";
import { photos, type Photo, type PhotoCredit } from "@/data/photos";
import type { Product, ProductCategory } from "@/data/products";
import type { ProductOrdering } from "@/data/ordering";
import type { Faq } from "@/lib/faq";
import type { ProductInput } from "@/lib/product-input";
import { ProductModel } from "@/models/Product";
import { connectDB } from "./mongoose";
import { descriptionForDisplay } from "./sanitize";

// The only module that reads or writes products. Everything else gets plain
// objects: `Product` for the public site, `AdminProduct` for the admin.

type CoverImage = { url: string; publicId: string; alt: string; blurDataURL?: string; credit?: PhotoCredit };

/** A product as stored (what `.lean()` returns). */
type ProductLean = {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  localName?: string;
  category: ProductCategory;
  kind: string;
  summary: string;
  description?: string;
  harvest: number[];
  forms: string[];
  specs?: { label: string; value: string }[];
  faqs?: Faq[];
  coverImage?: CoverImage;
  gallery?: string[];
  ordering?: Partial<ProductOrdering>;
  published: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Serialisable shape handed to the admin client components. */
export type AdminProduct = Omit<ProductLean, "_id" | "createdAt" | "updatedAt" | "specs" | "faqs" | "gallery" | "ordering"> & {
  id: string;
  specs: { label: string; value: string }[];
  faqs: Faq[];
  gallery: string[];
  ordering: ProductOrdering;
  createdAt: string;
  updatedAt: string;
};

export type ImageExtras = { blurDataURL?: string; credit?: PhotoCredit };

async function db() {
  await connectDB();
  return ProductModel;
}

const ordering = (o: Partial<ProductOrdering> | undefined): ProductOrdering => ({
  availability: o?.availability ?? "available",
  packaging: o?.packaging ?? [],
  deliveryRegions: o?.deliveryRegions ?? [],
  ...(o?.moq ? { moq: o.moq } : {}),
  ...(o?.leadTimeDays ? { leadTimeDays: o.leadTimeDays } : {}),
  ...(o?.samples ? { samples: o.samples } : {}),
  ...(o?.paymentTerms ? { paymentTerms: o.paymentTerms } : {}),
  ...(o?.notes ? { notes: o.notes } : {}),
});

// Mongoose subdocuments carry extra keys; copy only plain data across the
// server→client boundary. Bundled photos (StaticImageData) survive as plain objects.
const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * Shown on the public site for products whose photo hasn't been uploaded yet:
 * the general orchard photo, captioned honestly, never a different product.
 */
const PHOTO_PENDING: Photo = { ...photos.orchard, alt: "Product photo coming soon" };

function toProduct(d: ProductLean): Product {
  return plain({
    slug: d.slug,
    name: d.name,
    localName: d.localName || undefined,
    category: d.category,
    kind: d.kind,
    summary: d.summary,
    // Sanitised for the website (tables wrapped to scroll on phones).
    description: d.description ? descriptionForDisplay(d.description) || undefined : undefined,
    harvest: d.harvest,
    forms: d.forms,
    specs: d.specs ?? [],
    faqs: d.faqs ?? [],
    image: d.coverImage
      ? { src: d.coverImage.url, alt: d.coverImage.alt, blurDataURL: d.coverImage.blurDataURL, credit: d.coverImage.credit }
      : PHOTO_PENDING,
    gallery: (d.gallery ?? []).map((src, i) => ({ src, alt: `${d.name}, photo ${i + 2}` })),
    ordering: ordering(d.ordering),
  });
}

function toAdmin(d: ProductLean): AdminProduct {
  const { _id, createdAt, updatedAt, specs, faqs, gallery, ordering: o, ...rest } = d;
  return plain({
    ...rest,
    id: _id.toHexString(),
    specs: specs ?? [],
    faqs: faqs ?? [],
    gallery: gallery ?? [],
    ordering: ordering(o),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
}

function fields(input: ProductInput, extras: ImageExtras) {
  return {
    ...input,
    localName: input.localName ?? null,
    description: input.description ?? null,
    coverImage: input.coverImage ? { ...input.coverImage, ...extras } : undefined,
  };
}

// ---------- public ----------

/** null = the catalogue hasn't been set up in the database yet. */
export async function findPublishedProducts(): Promise<Product[] | null> {
  const Product = await db();
  if ((await Product.estimatedDocumentCount()) === 0) return null;
  // Lists are sent to the browser in full, and FAQs only show on the product's own page.
  const docs = await Product.find({ published: true }).select("-faqs").sort({ position: 1, _id: 1 }).lean<ProductLean[]>();
  return docs.map(toProduct);
}

/**
 * One published product by its ID (slug). `undefined` = the catalogue hasn't
 * been set up in the database yet; `null` = no such published product.
 */
export async function findPublishedProductBySlug(slug: string): Promise<Product | null | undefined> {
  const Product = await db();
  const doc = await Product.findOne({ slug, published: true }).lean<ProductLean>();
  if (doc) return toProduct(doc);
  return (await Product.estimatedDocumentCount()) === 0 ? undefined : null;
}

// ---------- admin ----------

export async function listProducts(): Promise<AdminProduct[]> {
  const docs = await (await db()).find().sort({ position: 1, _id: 1 }).lean<ProductLean[]>();
  return docs.map(toAdmin);
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  if (!isValidObjectId(id)) return null;
  const doc = await (await db()).findById(id).lean<ProductLean>();
  return doc ? toAdmin(doc) : null;
}

export async function slugTaken(slug: string, exceptId?: string) {
  const filter: Record<string, unknown> = { slug };
  if (exceptId && isValidObjectId(exceptId)) filter._id = { $ne: exceptId };
  return (await (await db()).exists(filter)) !== null;
}

export async function insertProduct(input: ProductInput, extras: ImageExtras = {}) {
  const Product = await db();
  const last = await Product.findOne().sort({ position: -1 }).select("position").lean<{ position: number }>();
  const doc = await Product.create({ ...fields(input, extras), position: (last?.position ?? -1) + 1 });
  return doc._id.toHexString();
}

/** Saves through the model so schema validation and hooks run. */
export async function updateProduct(id: string, input: ProductInput, extras: ImageExtras = {}) {
  if (!isValidObjectId(id)) return false;
  const doc = await (await db()).findById(id);
  if (!doc) return false;
  doc.set(fields(input, extras));
  await doc.save();
  return true;
}

export async function setProductPublished(id: string, published: boolean) {
  if (!isValidObjectId(id)) return false;
  const res = await (await db()).updateOne({ _id: id }, { $set: { published } });
  return res.matchedCount === 1;
}

/** Returns the deleted product so its photos can be cleaned up. */
export async function deleteProduct(id: string) {
  if (!isValidObjectId(id)) return null;
  const doc = await (await db()).findByIdAndDelete(id).lean<ProductLean>();
  return doc ? toAdmin(doc) : null;
}

export async function reorderProducts(ids: string[]) {
  const ops = ids
    .filter((id) => isValidObjectId(id))
    .map((id, position) => ({ updateOne: { filter: { _id: id }, update: { $set: { position } } } }));
  if (ops.length) await (await db()).bulkWrite(ops, { ordered: false });
}

export async function countProducts() {
  return (await db()).countDocuments();
}

/** Whether any product still uses this photo: as its cover, in its gallery, or inside its description. */
export async function isImageInUse(publicId: string, galleryUrl: string) {
  const inText = publicId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = await (await db()).exists({
    $or: [{ "coverImage.publicId": publicId }, { gallery: galleryUrl }, { description: { $regex: inText } }],
  });
  return found !== null;
}
