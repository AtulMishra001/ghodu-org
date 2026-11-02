import Image from "next/image";
import type { Photo } from "@/data/photos";
import { photoProps } from "@/lib/photo";

// Small rounded photo used in lists, chips and sheets.
export default function Thumb({ photo, className, sizes = "64px" }: { photo: Photo; className?: string; sizes?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-surface-muted ${className ?? "size-12 rounded-tile"}`}>
      <Image {...photoProps(photo)} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}
