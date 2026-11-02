"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import type { Product } from "@/data/products";
import { harvestStatus } from "@/lib/catalogue";
import AddButton from "./AddButton";
import { useCatalogue } from "./CatalogueProvider";
import { photoProps } from "@/lib/photo";

// Grid card: a tall photo that carries the name, with the spec strip underneath.
// On hover (desktop) the summary rises into view; a tap opens the product page.
export default function ProductTile({ product, index }: { product: Product; index: number }) {
  const { month } = useCatalogue();
  const status = harvestStatus(product.harvest, month);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      <article className="group relative">
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-inverse text-inverse-foreground">
          <Image
            {...photoProps(product.image)}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-inverse/95 via-inverse/20 to-transparent transition-opacity duration-500 group-hover:from-inverse" />

          <Link
            href={`/products/${product.slug}`}
            aria-label={`${product.name}: view product`}
            className="absolute inset-0 flex flex-col justify-end p-3 text-left md:p-5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-inverse-foreground/70 md:text-xs">
              {product.kind}
            </span>
            <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-xl leading-tight font-medium md:text-[28px]">{product.name}</span>
              {product.localName && (
                <span className="text-xs italic text-inverse-foreground/70 md:text-sm">{product.localName}</span>
              )}
            </span>
            {/* desktop hover: summary + call to action rise in */}
            <span className="hidden grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-premium group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] md:grid">
              <span className="overflow-hidden">
                <span className="block pt-2 text-sm text-inverse-foreground/85">{product.summary}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  View product
                  <ArrowRightIcon size={16} weight="bold" />
                </span>
              </span>
            </span>
          </Link>

          <span
            className={`pointer-events-none absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold md:top-4 md:left-4 md:px-2.5 md:text-xs ${
              status.now ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground backdrop-blur"
            }`}
          >
            {status.now ? (
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/70" />
                <span className="relative size-1.5 rounded-full bg-primary-foreground" />
              </span>
            ) : (
              <span className="size-1.5 rounded-full bg-accent" />
            )}
            {status.now ? "In season" : status.label}
          </span>

          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <AddButton product={product} round />
          </div>
        </div>

        <div className="px-0.5 pt-2.5 md:pt-3">
          <div className="flex items-baseline justify-between gap-2 text-xs md:text-sm">
            <span className="truncate font-semibold">{product.forms.join(" · ")}</span>
            <span className="shrink-0 text-muted-foreground">{product.category}</span>
          </div>
          <div className="mt-2">
            <MonthBar harvest={product.harvest} highlight={month} />
          </div>
        </div>
      </article>
    </motion.li>
  );
}
