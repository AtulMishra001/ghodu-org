"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ImageSquareIcon, ImagesIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import { availabilityLabels, formatQuantity } from "@/data/ordering";
import type { AdminProduct } from "@/lib/server/products";
import { photoProps } from "@/lib/photo";
import Switch from "../Switch";
import { card } from "../styles";

// One product in the admin grid. The whole card opens the editor; the
// switch, edit and delete buttons sit above that link.
export default function ProductCard({
  product: p,
  index,
  onToggle,
  onDelete,
}: {
  product: AdminProduct;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const href = `/admin/products/${p.id}`;
  const photos = (p.coverImage ? 1 : 0) + p.gallery.length;
  const availability = p.ordering.availability;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.25), ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      <article className={`${card} group relative flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-elevated`}>
        <Link href={href} aria-label={`Edit ${p.name}`} className="absolute inset-0 z-0" />

        <div className="pointer-events-none relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {p.coverImage ? (
            <Image
              {...photoProps({ src: p.coverImage.url, alt: p.coverImage.alt, blurDataURL: p.coverImage.blurDataURL })}
              alt={p.coverImage.alt}
              fill
              sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className={`object-cover transition-[transform,filter] duration-700 ease-premium group-hover:scale-[1.04] ${p.published ? "" : "grayscale-[60%]"}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-b border-dashed text-muted-foreground">
              <ImageSquareIcon size={32} />
              <span className="text-sm font-semibold">No cover photo yet</span>
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                p.published ? "bg-primary text-primary-foreground" : "bg-background/90 text-muted-foreground"
              }`}
            >
              {p.published ? "Live" : "Hidden"}
            </span>
            {photos > 1 && (
              <span className="flex items-center gap-1 rounded-full bg-inverse/70 px-2 py-1 text-xs font-semibold text-inverse-foreground backdrop-blur">
                <ImagesIcon size={14} />
                {photos}
              </span>
            )}
          </div>
          {availability !== "available" && (
            <span className="absolute bottom-3 left-3 rounded-md bg-background/92 px-2 py-0.5 text-xs font-semibold backdrop-blur">
              {availabilityLabels[availability]}
            </span>
          )}
        </div>

        <div className="pointer-events-none flex flex-1 flex-col p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {p.category} · {p.kind}
          </p>
          <h2 className="mt-1 flex items-baseline gap-2">
            <span className="truncate font-display text-[22px] leading-tight font-medium group-hover:text-primary">{p.name}</span>
            {p.localName && <span className="truncate text-sm italic text-muted-foreground">{p.localName}</span>}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">MOQ</dt>
            <dd className={`text-right font-semibold ${p.ordering.moq ? "" : "text-muted-foreground"}`}>
              {p.ordering.moq ? formatQuantity(p.ordering.moq) : "Not set"}
            </dd>
            <dt className="text-muted-foreground">Forms</dt>
            <dd className="truncate text-right font-semibold">{p.forms.join(", ")}</dd>
          </dl>
          <div className="mt-3">
            <MonthBar harvest={p.harvest} />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 border-t px-4 py-2.5">
          <Switch checked={p.published} onChange={onToggle} label={`Show ${p.name} on the website`} />
          <span className="text-xs font-semibold text-muted-foreground">On website</span>
          <span className="ml-auto flex gap-1">
            <Link
              href={href}
              aria-label={`Edit ${p.name}`}
              className="grid size-9 place-items-center rounded-control text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
            >
              <PencilSimpleIcon size={18} />
            </Link>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${p.name}`}
              className="grid size-9 place-items-center rounded-control text-muted-foreground transition hover:bg-red-50 hover:text-red-700"
            >
              <TrashIcon size={18} />
            </button>
          </span>
        </div>
      </article>
    </motion.li>
  );
}
