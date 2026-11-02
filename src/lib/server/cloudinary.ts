import "server-only";
import { createHash } from "node:crypto";
import { IMAGE_FORMAT, MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/lib/image-rules";
import { env } from "./env";

// Minimal Cloudinary client over its REST API — signing, upload, delete —
// so the browser can upload straight to Cloudinary with a server signature
// and large photos never pass through our server.

export const PRODUCT_FOLDER = "ghodu-agro/products";
/** Images placed inside rich-text product descriptions. */
export const CONTENT_FOLDER = "ghodu-agro/content";
const FOLDERS = { product: PRODUCT_FOLDER, content: CONTENT_FOLDER } as const;
export type UploadKind = keyof typeof FOLDERS;

function sign(params: Record<string, string | number>) {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(payload + env("CLOUDINARY_API_SECRET")).digest("hex");
}

const api = (path: string) => `https://api.cloudinary.com/v1_1/${env("CLOUDINARY_CLOUD_NAME")}/${path}`;

/**
 * Parameters the browser needs for one signed upload into the products folder.
 * `allowed_formats` is part of the signature, so Cloudinary itself rejects
 * anything that isn't WebP, and the browser can't change it.
 */
export function uploadSignature(kind: UploadKind = "product") {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = FOLDERS[kind];
  const params = { allowed_formats: IMAGE_FORMAT, folder, timestamp };
  return {
    url: api("image/upload"),
    apiKey: env("CLOUDINARY_API_KEY"),
    allowedFormats: IMAGE_FORMAT,
    folder,
    timestamp,
    signature: sign(params),
  };
}

/**
 * Server-side check of an uploaded file before it's saved to a product: asks
 * Cloudinary for the stored file's real format and size (the browser's own
 * checks can be bypassed). Returns a problem to show, or null if it's fine.
 */
export async function checkUploadedImage(publicId: string): Promise<string | null> {
  const auth = Buffer.from(`${env("CLOUDINARY_API_KEY")}:${env("CLOUDINARY_API_SECRET")}`).toString("base64");
  const res = await fetch(api(`resources/image/upload/${publicId}`), { headers: { Authorization: `Basic ${auth}` } });
  if (res.status === 404) return "That photo is no longer on Cloudinary. Upload it again.";
  if (!res.ok) throw new Error(`Cloudinary lookup failed (${res.status})`);
  const info = (await res.json()) as { format?: string; bytes?: number };
  if (info.format !== IMAGE_FORMAT) return "Only WebP photos are allowed.";
  if ((info.bytes ?? Infinity) > MAX_IMAGE_BYTES) return `Photos must be ${MAX_IMAGE_MB} MB or smaller.`;
  return null;
}

/**
 * Uploads through our server, for the blog API and seed script. `file` is the
 * image or a remote URL for Cloudinary to fetch. allowed_formats is signed, so
 * Cloudinary refuses anything that isn't WebP, and no public_id is sent, so
 * every upload gets its own unique name.
 */
export async function uploadToFolder(file: Blob | string, folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { allowed_formats: IMAGE_FORMAT, folder, timestamp };
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", env("CLOUDINARY_API_KEY"));
  body.set("timestamp", String(timestamp));
  body.set("folder", folder);
  body.set("allowed_formats", IMAGE_FORMAT);
  body.set("signature", sign(params));
  const res = await fetch(api("image/upload"), { method: "POST", body });
  const json = (await res.json()) as { secure_url?: string; public_id?: string; bytes?: number; width?: number; height?: number; format?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url || !json.public_id) throw new Error(json.error?.message ?? "Cloudinary rejected the upload.");
  return { url: json.secure_url, publicId: json.public_id, bytes: json.bytes, width: json.width, height: json.height, format: json.format };
}

/** Best-effort delete; a leftover image is harmless, a failed save is not. */
export async function destroyImage(publicId: string) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const body = new FormData();
    body.set("public_id", publicId);
    body.set("timestamp", String(timestamp));
    body.set("api_key", env("CLOUDINARY_API_KEY"));
    body.set("signature", sign({ public_id: publicId, timestamp }));
    await fetch(api("image/destroy"), { method: "POST", body });
  } catch (err) {
    console.error("Cloudinary destroy failed", publicId, err);
  }
}

/** Only images we uploaded into our own folder are accepted from the admin form. */
export function isOwnImage(publicId: string) {
  return Object.values(FOLDERS).some((f) => publicId.startsWith(`${f}/`)) && /^[\w\-/]+$/.test(publicId);
}

/** Capped at 2400px so the site's image optimiser never pulls a huge original. */
export function deliveryUrl(publicId: string) {
  return `https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/c_limit,w_2400,q_auto/${publicId}`;
}

/**
 * The public_id inside one of our Cloudinary URLs (gallery photos are stored
 * as plain URLs). Returns null for anything outside our cloud and folder.
 */
export function publicIdFromUrl(url: string) {
  const prefix = `https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const path = url.slice(prefix.length).split("?")[0];
  const at = Math.max(...Object.values(FOLDERS).map((f) => path.indexOf(`${f}/`)));
  if (at === -1) return null;
  const publicId = path.slice(at).replace(/\.[a-z0-9]+$/i, "");
  return isOwnImage(publicId) ? publicId : null;
}

/** A tiny blurred JPEG as a data URL, shown while the real photo loads. */
export async function blurPreview(publicId: string) {
  try {
    const url = `https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/w_24,q_40,e_blur:300,f_jpg/${publicId}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return undefined;
  }
}
