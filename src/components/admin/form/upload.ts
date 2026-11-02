import { getUploadSignature } from "@/app/admin/actions";

// Browser → Cloudinary uploads, signed by the server so the API secret never
// leaves it and large photos never pass through our server.

import { IMAGE_MIME, MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/lib/image-rules";

export { IMAGE_MIME, MAX_IMAGE_MB };

export type Uploaded = { url: string; publicId: string };

/** A human-readable problem with the file, or null if it can be uploaded. */
// First of three checks (then Cloudinary's allowed_formats, then the server
// before saving). This one just gives instant feedback.
export function checkFile(file: File) {
  if (file.type !== IMAGE_MIME || !/\.webp$/i.test(file.name)) return `${file.name}: only WebP photos are allowed.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. Photos must be ${MAX_IMAGE_MB} MB or smaller.`;
  return null;
}

/** `kind: "content"` stores images used inside the rich-text description in their own folder. */
export async function uploadImage(file: File, onProgress: (fraction: number) => void, kind: "product" | "content" = "product"): Promise<Uploaded> {
  const sig = await getUploadSignature(kind);
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.set("file", file);
    body.set("api_key", sig.apiKey);
    body.set("timestamp", String(sig.timestamp));
    body.set("signature", sig.signature);
    body.set("folder", sig.folder);
    body.set("allowed_formats", sig.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", sig.url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve({ url: json.secure_url, publicId: json.public_id });
        else reject(new Error(json.error?.message ?? "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection."));
    xhr.send(body);
  });
}

/** The Cloudinary public_id inside a photo URL (gallery photos are stored as URLs). */
export function publicIdOf(url: string) {
  const at = url.search(/ghodu-agro\/(products|content)\//);
  return at === -1 ? null : url.slice(at).split("?")[0].replace(/\.[a-z0-9]+$/i, "");
}
