// Upload rules for product photos, shared by the browser check, the signed
// Cloudinary upload and the server-side check before saving.
export const IMAGE_FORMAT = "webp";
export const IMAGE_MIME = "image/webp";
export const MAX_IMAGE_MB = 2;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/** True when the bytes really are a WebP file ("RIFF....WEBP"), whatever the name or type claims. */
export function isWebpBytes(bytes: Uint8Array) {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  return bytes.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
}
