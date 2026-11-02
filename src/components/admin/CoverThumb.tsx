import { ImageSquareIcon } from "@phosphor-icons/react";
import Thumb from "@/components/shared/Thumb";
import type { AdminProduct } from "@/lib/server/products";

// A product's cover as a small thumbnail, or a clear "no photo yet" tile.
export default function CoverThumb({ product, className, sizes }: { product: AdminProduct; className: string; sizes?: string }) {
  const c = product.coverImage;
  if (!c)
    return (
      <span title="No cover photo yet" className={`grid shrink-0 place-items-center border border-dashed bg-surface-muted text-muted-foreground ${className}`}>
        <ImageSquareIcon size={20} />
      </span>
    );
  return <Thumb photo={{ src: c.url, alt: "", blurDataURL: c.blurDataURL }} className={className} sizes={sizes} />;
}
