import Image from "next/image";
import type { Photo } from "@/data/photos";
import { photoProps } from "@/lib/photo";

// Fills the heading column beside a long FAQ list on large screens only.
export default function FaqPhoto({ photo }: { photo: Photo }) {
  return (
    <div className="relative hidden aspect-[3/2] overflow-hidden rounded-card bg-surface-muted lg:block">
      <Image {...photoProps(photo)} alt={photo.alt} fill sizes="40vw" className="object-cover" />
    </div>
  );
}
