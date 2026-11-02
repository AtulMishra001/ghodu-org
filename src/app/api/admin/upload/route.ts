import { BLOG_CONTENT_IMAGE_FOLDER, BLOG_CONTENT_IMAGE_MAX_BYTES, BLOG_HERO_MAX_BYTES, BLOG_IMAGE_FOLDER } from "@/data/blog";
import { IMAGE_MIME, isWebpBytes } from "@/lib/image-rules";
import { jsonError, jsonOk, unauthorized } from "@/lib/server/api";
import { uploadToFolder } from "@/lib/server/cloudinary";

// The folder decides the limit, so the server enforces the same rules as the form.
const FOLDER_LIMITS: Record<string, number> = {
  [BLOG_IMAGE_FOLDER]: BLOG_HERO_MAX_BYTES,
  [BLOG_CONTENT_IMAGE_FOLDER]: BLOG_CONTENT_IMAGE_MAX_BYTES,
};
const ENVELOPE_BYTES = 64 * 1024; // room for the multipart boundaries and field names

const mb = (bytes: number) => `${bytes / 1024 / 1024} MB`;

export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  // Refuse oversized bodies before reading them into memory.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > BLOG_HERO_MAX_BYTES + ENVELOPE_BYTES) return jsonError(`Images must be ${mb(BLOG_HERO_MAX_BYTES)} or smaller.`, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Send the image as multipart form data.", 400);
  }
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "");
  const limit = FOLDER_LIMITS[folder];
  if (!limit) return jsonError("Unknown upload folder.", 400);
  if (!(file instanceof File)) return jsonError("Choose an image to upload.", 400);
  if (file.size > limit) return jsonError(`Images here must be ${mb(limit)} or smaller.`, 413);

  // Checks the bytes as well as the claimed type, which a client can set to anything.
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type !== IMAGE_MIME || !isWebpBytes(bytes)) return jsonError("Only WebP images are allowed.", 415);

  try {
    return jsonOk({ success: true, ...(await uploadToFolder(new Blob([bytes], { type: IMAGE_MIME }), folder)) }, 201);
  } catch (err) {
    console.error("[upload]", err);
    return jsonError(err instanceof Error ? err.message : "Upload failed. Try again.", 502);
  }
}
