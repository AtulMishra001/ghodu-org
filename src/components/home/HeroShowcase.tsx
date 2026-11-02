"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { BasketIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import type { Product } from "@/data/products";
import { months } from "@/data/site";
import { haptic } from "@/lib/haptics";
import { useMonth } from "@/lib/use-month";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 5000;

// Hero visual: one product at a time, full photo, with its spec card.
// Cycles on its own; tap a thumbnail or swipe to choose. Pauses while hovered.
export default function HeroShowcase({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const month = useMonth();
  const quote = useQuote();
  const product = products[index];
  const inSeason = month !== null && product.harvest.includes(month);
  const added = quote.has(product.slug);
  const season = product.harvest.map((m) => months[m]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % products.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduce, products.length]);

  function select(i: number) {
    haptic(5);
    setIndex((i + products.length) % products.length);
  }

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -50 || info.velocity.x < -400) select(index + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) select(index - 1);
  }

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative isolate h-full min-h-[400px] overflow-hidden rounded-card bg-inverse sm:min-h-[480px] lg:min-h-[600px]">
        {/* photo layer — swipeable on touch */}
        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={onSwipe} className="absolute inset-0 -z-10 touch-pan-y">
          <AnimatePresence initial={false}>
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.7 }, scale: { duration: SLIDE_MS / 1000 + 1, ease: "linear" } }}
              className="absolute inset-0"
            >
              <Image
                {...photoProps(product.image)}
                alt={product.image.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                {...(index === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
                className="pointer-events-none object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-inverse via-inverse/25 to-inverse/30" />
        </motion.div>

        {/* top: status + counter */}
        <div className="pointer-events-none flex items-start justify-between p-4 md:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${product.slug}-${inSeason}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur"
            >
              {inSeason ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                    <span className="relative size-2 rounded-full bg-primary" />
                  </span>
                  Harvesting now
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-accent" />
                  Harvest {season[0]}
                  {season.length > 1 && `–${season[season.length - 1]}`}
                </>
              )}
            </motion.span>
          </AnimatePresence>
          <span className="rounded-full bg-inverse/50 px-3 py-1.5 text-xs font-semibold text-inverse-foreground tabular backdrop-blur">
            {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
          </span>
        </div>

        {/* bottom: thumbnails + spec card */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 md:p-5">
          <div role="tablist" aria-label="Products" className="rail -mx-4 scroll-px-4 gap-2 px-4 md:mx-0 md:px-0">
            {products.map((p, i) => {
              const active = i === index;
              return (
                <button
                  key={p.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={p.name}
                  onClick={() => select(i)}
                  className={`relative size-12 shrink-0 overflow-hidden rounded-tile transition-[transform,opacity] duration-300 active:scale-90 md:size-14 ${
                    active ? "opacity-100 ring-2 ring-accent ring-offset-2 ring-offset-inverse" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image {...photoProps(p.image)} alt="" fill sizes="56px" className="object-cover" />
                  {active && !paused && !reduce && (
                    <motion.span
                      key={index}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                      className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-card bg-background/95 p-4 text-foreground shadow-elevated backdrop-blur md:max-w-md md:p-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-medium md:text-[28px]">{product.name}</span>
                    {product.localName && <span className="text-sm italic text-muted-foreground">{product.localName}</span>}
                  </p>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{product.category}</span>
                </div>
                <dl className="mt-3 grid grid-cols-3 divide-x border-y text-sm">
                  {[
                    ["Harvest", season.length > 1 ? `${season[0]}–${season[season.length - 1]}` : season[0]],
                    ["Forms", product.forms.join(", ")],
                    ["Supply", "Bulk"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-3 py-2 first:pl-0">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="truncate font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>
            <button
              type="button"
              onClick={() => (added ? quote.open() : quote.add(product.slug))}
              className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-control text-sm font-semibold transition-[transform,background-color] active:scale-[0.97] ${
                added ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }`}
            >
              {added ? <CheckIcon size={18} weight="bold" /> : <PlusIcon size={18} weight="bold" />}
              {added ? `${product.name} is in your enquiry — review` : `Add ${product.name.toLowerCase()} to enquiry`}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: the enquiry basket floats beside the visual and reacts as items are added */}
      <motion.button
        type="button"
        onClick={() => quote.open()}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1, ease }}
        whileHover={{ y: -2 }}
        className="absolute top-[38%] -left-6 hidden items-center gap-3 rounded-card border bg-surface py-3 pr-5 pl-3 text-left shadow-elevated lg:flex"
      >
        <span className="relative grid size-11 place-items-center rounded-tile bg-accent text-accent-foreground">
          <BasketIcon size={22} weight="duotone" />
          <AnimatePresence>
            {quote.count > 0 && (
              <motion.span
                key={quote.count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 16 }}
                className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground tabular"
              >
                {quote.count}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your enquiry</span>
          <span className="block text-sm font-semibold">
            {quote.count === 0 ? "Add products to start" : `${quote.count} product${quote.count > 1 ? "s" : ""} · Review`}
          </span>
        </span>
      </motion.button>
    </div>
  );
}
