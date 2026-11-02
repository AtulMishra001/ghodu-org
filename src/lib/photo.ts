import type { Photo } from "@/data/photos";

// Spreads into next/image for either a bundled photo or a Cloudinary URL.
// Bundled photos carry their own blur; uploaded ones use the tiny preview
// saved with the product, or no placeholder when there isn't one.
export function photoProps(photo: Photo) {
  if (typeof photo.src !== "string") return { src: photo.src, placeholder: "blur" as const };
  if (photo.blurDataURL) return { src: photo.src, placeholder: "blur" as const, blurDataURL: photo.blurDataURL };
  return { src: photo.src, placeholder: "empty" as const };
}
