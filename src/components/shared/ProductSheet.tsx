"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowRightIcon, CheckCircleIcon, PlusIcon } from "@phosphor-icons/react";
import { availabilityLabels, formatLeadTime, formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";
import { photoProps } from "@/lib/photo";
import { seasonLabel } from "@/lib/season";
import { button } from "@/lib/ui";
import MonthBar from "./MonthBar";
import { useQuote } from "./QuoteProvider";
import { Sheet } from "./Sheet";

const ON_REQUEST = "On request";

// Spec-sheet detail for one product. Lives in a sheet so the visitor never loses their place.
export default function ProductSheet({
  product,
  onClose,
  month,
}: {
  product: Product | null;
  onClose: () => void;
  month?: number | null;
}) {
  const quote = useQuote();
  const inQuote = product ? quote.has(product.slug) : false;

  return (
    <Sheet open={!!product} onClose={onClose} title={product?.name ?? ""} description={product?.localName ? `Kashmiri: ${product.localName}` : undefined}>
      {product && (
        <div className="flex flex-col gap-5 pb-2">
          {/* key resets the gallery position when another product opens */}
          <Gallery key={product.slug} product={product} />

          <div>
            <p className="text-[15px] text-muted-foreground">{product.summary}</p>
            {product.description && (
              // Sanitised rich text from the data layer.
              <div className="product-description mt-3 text-[15px]" dangerouslySetInnerHTML={{ __html: product.description }} />
            )}
          </div>

          <SpecTable
            title="Product"
            rows={[
              ["Line", `${product.category} · ${product.kind}`],
              ["Harvest", seasonLabel(product.harvest)],
              ["Forms", product.forms.join(", ")],
              ["Origin", "Kashmir valley"],
              ...(product.specs ?? []).map((s) => [s.label, s.value] as [string, string]),
            ]}
          />

          <Ordering product={product} />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Harvest calendar</p>
            <MonthBar harvest={product.harvest} highlight={month} />
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              quote.open(product.slug);
            }}
            className={`${button(inQuote ? "outline" : "primary", "lg")} w-full`}
          >
            {inQuote ? <CheckCircleIcon size={20} weight="fill" className="text-primary" /> : <PlusIcon size={20} weight="bold" />}
            {inQuote ? "In your enquiry — review" : "Add to enquiry"}
          </button>
          <Link href={`/products/${product.slug}`} onClick={onClose} className={`${button("outline", "lg")} -mt-2 w-full`}>
            Full product page
            <ArrowRightIcon size={18} />
          </Link>
        </div>
      )}
    </Sheet>
  );
}

function Gallery({ product }: { product: Product }) {
  const photos = [product.image, ...(product.gallery ?? [])];
  const [index, setIndex] = useState(0);
  const photo = photos[index];
  const go = (i: number) => setIndex((i + photos.length) % photos.length);

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -50 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(index - 1);
  }

  return (
    <div>
      <motion.div
        drag={photos.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onSwipe}
        className="relative aspect-[16/10] touch-pan-y overflow-hidden rounded-card bg-surface-muted"
      >
        <AnimatePresence initial={false}>
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
            <Image {...photoProps(photo)} alt={photo.alt} fill sizes="(min-width: 768px) 440px, 100vw" className="pointer-events-none object-cover" />
          </motion.div>
        </AnimatePresence>
        {photos.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-inverse/70 px-2.5 py-1 text-xs font-semibold text-inverse-foreground tabular backdrop-blur">
            {index + 1} / {photos.length}
          </span>
        )}
      </motion.div>
      {photos.length > 1 && (
        <div role="tablist" aria-label="Photos" className="rail mt-2 gap-2">
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-tile bg-surface-muted transition ${i === index ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"}`}
            >
              <Image {...photoProps(p)} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// "How to order": every ordering field, with "On request" where it isn't set,
// so buyers always see the full picture.
function Ordering({ product }: { product: Product }) {
  const o = product.ordering;
  const rows: [string, string][] = [
    ["Availability", o ? availabilityLabels[o.availability] : ON_REQUEST],
    ["Minimum order", o?.moq ? formatQuantity(o.moq) : ON_REQUEST],
    ["Packing", o?.packaging.length ? o.packaging.map((p) => `${p.label} (${formatQuantity(p.size)})`).join(", ") : ON_REQUEST],
    ["Dispatch", o?.leadTimeDays ? `${formatLeadTime(o.leadTimeDays)} after confirmation` : ON_REQUEST],
    ["Samples", o?.samples ? (o.samples.available ? o.samples.note || "Available" : "Not available") : ON_REQUEST],
    ["Payment", o?.paymentTerms || ON_REQUEST],
    ["Delivers to", o?.deliveryRegions.length ? o.deliveryRegions.join(", ") : ON_REQUEST],
  ];
  return (
    <div>
      <SpecTable title="How to order" rows={rows} />
      {o?.notes && <p className="mt-2 rounded-card bg-surface-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-line">{o.notes}</p>}
    </div>
  );
}

function SpecTable({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <dl className="divide-y rounded-card border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-4 py-3 text-[15px]">
            <dt className="shrink-0 text-muted-foreground">{k}</dt>
            <dd className={`text-right font-semibold ${v === ON_REQUEST ? "font-normal text-muted-foreground" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
