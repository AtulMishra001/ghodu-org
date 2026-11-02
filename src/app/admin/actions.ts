"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { Error as MongooseError } from "mongoose";
import { parseProductInput, type ProductErrors } from "@/lib/product-input";
import { requireAdmin } from "@/lib/server/auth";
import {
  blurPreview,
  checkUploadedImage,
  deliveryUrl,
  destroyImage,
  isOwnImage,
  publicIdFromUrl,
  uploadSignature,
} from "@/lib/server/cloudinary";
import * as repo from "@/lib/server/products";
import { sanitizeRichText } from "@/lib/server/sanitize";
import { imageSources } from "@/lib/rich-text";

// Every action re-checks the session itself: server actions are public
// endpoints, so the proxy and page checks alone aren't enough.

export type SaveResult = { ok: true; id: string } | { ok: false; errors: ProductErrors; message?: string };
export type ActionResult = { ok: true } | { ok: false; message: string };

const fail = (message: string): ActionResult => ({ ok: false, message });

/** Expires the cached public catalogue so changes show on the next request. */
function refreshSite() {
  updateTag("products");
}

/**
 * Deletes photos from Cloudinary once no product uses them any more. Runs
 * after the response is sent, so the admin isn't kept waiting on Cloudinary.
 */
function cleanUpImages(publicIds: string[]) {
  if (!publicIds.length) return;
  after(async () => {
    await Promise.all(
      [...new Set(publicIds)].map(async (id) => {
        if (!(await repo.isImageInUse(id, deliveryUrl(id)))) await destroyImage(id);
      }),
    );
  });
}

/** Our Cloudinary public_ids among the images in a description (external images are ignored). */
const descriptionImageIds = (html: string | undefined) =>
  imageSources(html).map(publicIdFromUrl).filter((id): id is string => !!id);

/**
 * Cloudinary public_ids of all of a product's photos: the cover's is stored;
 * gallery and description images are read from their URLs.
 */
const imageIds = (p: Pick<repo.AdminProduct, "coverImage" | "gallery" | "description">) => [
  ...(p.coverImage ? [p.coverImage.publicId] : []),
  ...p.gallery.map(publicIdFromUrl).filter((id): id is string => !!id),
  ...descriptionImageIds(p.description),
];

const orderingFields: Record<string, keyof ProductErrors> = {
  moq: "moq",
  packaging: "packaging",
  leadTimeDays: "leadTime",
  samples: "samples",
  paymentTerms: "paymentTerms",
  deliveryRegions: "deliveryRegions",
  notes: "orderNotes",
};

/** The form field a Mongoose error path belongs to, e.g. "ordering.moq.value" → "moq". */
function fieldFor(path: string): keyof ProductErrors {
  const [head, sub] = path.split(".");
  if (head === "coverImage") return sub === "alt" ? "coverAlt" : "coverImage";
  if (head === "ordering") return orderingFields[sub] ?? "orderNotes";
  return head as keyof ProductErrors;
}

/** Schema errors from Mongoose mapped onto form fields, as a last line of defence. */
function schemaErrors(err: MongooseError.ValidationError): ProductErrors {
  const errors: ProductErrors = {};
  for (const [path, e] of Object.entries(err.errors)) errors[fieldFor(path)] ??= e.message;
  return errors;
}

export async function getUploadSignature(kind: "product" | "content" = "product") {
  await requireAdmin();
  return uploadSignature(kind === "content" ? "content" : "product");
}

export async function saveProduct(id: string | null, draft: unknown): Promise<SaveResult> {
  await requireAdmin();

  const parsed = parseProductInput(draft);
  if (parsed.errors) return { ok: false, errors: parsed.errors, message: "Check the highlighted fields." };
  const input = parsed.data;

  // Only accept photos from our own Cloudinary folder, and rebuild their URLs server-side.
  const cover = input.coverImage;
  if (cover && !isOwnImage(cover.publicId)) return { ok: false, errors: { coverImage: "Upload the cover photo again." } };
  if (cover) cover.url = deliveryUrl(cover.publicId);
  const galleryIds = input.gallery.map(publicIdFromUrl);
  if (galleryIds.some((g) => !g)) return { ok: false, errors: { gallery: "Upload the gallery photos again." } };
  input.gallery = [...new Set(galleryIds.map((g) => deliveryUrl(g!)))];
  // Rich-text description: stored sanitised, so only allowed tags ever reach the database.
  if (input.description) input.description = sanitizeRichText(input.description) || undefined;

  try {
    if (await repo.slugTaken(input.slug, id ?? undefined)) {
      return { ok: false, errors: { slug: "Another product already uses this ID." } };
    }

    const previous = id ? await repo.getProduct(id) : null;
    if (id && !previous) return { ok: false, errors: {}, message: "This product no longer exists." };

    // Photos new to this product are checked on Cloudinary (WebP, 2 MB max).
    // A rejected one is deleted straight away so it can't linger.
    const existing = new Set(previous ? imageIds(previous) : []);
    const errors: ProductErrors = {};
    for (const [field, publicId] of [
      ...(cover ? [["coverImage", cover.publicId] as const] : []),
      ...galleryIds.map((g) => ["gallery", g!] as const),
      ...descriptionImageIds(input.description).map((g) => ["description", g] as const),
    ]) {
      if (existing.has(publicId)) continue;
      const problem = await checkUploadedImage(publicId);
      if (problem) {
        errors[field] ??= problem;
        after(() => destroyImage(publicId));
      }
    }
    if (Object.keys(errors).length) return { ok: false, errors, message: "One or more photos weren't accepted." };

    const coverChanged = previous?.coverImage?.publicId !== cover?.publicId;
    const extras = !cover
      ? {}
      : coverChanged
        ? { blurDataURL: await blurPreview(cover.publicId) }
        : { blurDataURL: previous?.coverImage?.blurDataURL, credit: previous?.coverImage?.credit };

    let savedId = id;
    if (id) await repo.updateProduct(id, input, extras);
    else savedId = await repo.insertProduct(input, extras);

    if (previous) {
      const kept = new Set(imageIds(input));
      cleanUpImages(imageIds(previous).filter((p) => !kept.has(p)));
    }

    refreshSite();
    return { ok: true, id: savedId! };
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return { ok: false, errors: schemaErrors(err), message: "Check the highlighted fields." };
    }
    if ((err as { code?: number }).code === 11000) return { ok: false, errors: { slug: "Another product already uses this ID." } };
    console.error("[admin] saveProduct", err);
    return { ok: false, errors: {}, message: "Couldn't save: the database didn't respond. Try again." };
  }
}

/**
 * Deletes photos uploaded in the form but never saved to a product: after
 * a photo is replaced or removed before saving, or the form is cancelled.
 * Only touches our own folder, and never a photo a product still uses.
 */
export async function discardUploads(publicIds: string[]): Promise<void> {
  await requireAdmin();
  if (!Array.isArray(publicIds)) return;
  cleanUpImages(publicIds.filter((id) => typeof id === "string" && isOwnImage(id)).slice(0, 20));
}

export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    if (!(await repo.setProductPublished(id, published))) return fail("This product no longer exists.");
    refreshSite();
    return { ok: true };
  } catch (err) {
    console.error("[admin] setPublished", err);
    return fail("Couldn't update. Try again.");
  }
}

export async function removeProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await repo.deleteProduct(id);
    if (!deleted) return fail("This product was already deleted.");
    cleanUpImages(imageIds(deleted));
    refreshSite();
    return { ok: true };
  } catch (err) {
    console.error("[admin] removeProduct", err);
    return fail("Couldn't delete. Try again.");
  }
}

export async function saveOrder(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return fail("Invalid order.");
  try {
    await repo.reorderProducts(ids);
    refreshSite();
    return { ok: true };
  } catch (err) {
    console.error("[admin] saveOrder", err);
    return fail("Couldn't save the new order. Try again.");
  }
}
