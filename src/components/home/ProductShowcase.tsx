"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon, BasketIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import { useQuote } from "@/components/shared/QuoteProvider";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product, ProductCategory } from "@/data/products";
import { months } from "@/data/site";
import { haptic } from "@/lib/haptics";
import { button } from "@/lib/ui";
import { photoProps } from "@/lib/photo";

type Filter = "All" | ProductCategory;

export default function ProductShowcase({
  products,
  categories,
}: {
  products: Product[];
  categories: readonly ProductCategory[];
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = ["All", ...categories];
  const shown = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <Section id="products">
      <SectionHeader
        index="02"
        kicker="Products"
        title="Produce we supply"
        summary="Sourced across the valley and sold in bulk. Tap any product for its full details."
        action={
          <div className="hidden md:block">
            <Link href="/products" className={button("outline", "md")}>
              Full catalogue
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        }
      />

      <div role="group" aria-label="Filter by category" className="rail -mx-4 mt-5 gap-2 px-4 md:mx-0 md:px-0">
        {filters.map((f) => {
          const active = f === filter;
          const count = f === "All" ? products.length : products.filter((p) => p.category === f).length;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (active) return;
                haptic(5);
                setFilter(f);
              }}
              className={`relative flex h-10 shrink-0 items-center gap-2 rounded-control border px-4 text-sm font-semibold transition-colors ${
                active ? "border-primary text-primary-foreground" : "bg-surface text-foreground hover:border-primary/50"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="product-filter"
                  className="absolute -inset-px rounded-control bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{f}</span>
              <span className={`relative text-xs tabular ${active ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul
        layout
        className="rail -mx-4 mt-4 scroll-pl-4 gap-3 px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
          <EnquiryTile key="enquiry-tile" />
        </AnimatePresence>
      </motion.ul>

      <div className="mt-4 md:hidden">
        <Link href="/products" className={`${button("outline", "md")} w-full`}>
          See the full catalogue
          <ArrowRightIcon size={18} />
        </Link>
      </div>

    </Section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const href = `/products/${product.slug}`;
  const quote = useQuote();
  const added = quote.has(product.slug);
  const season = product.harvest.map((m) => months[m]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className="w-[78%] shrink-0 sm:w-[46%] md:w-auto"
    >
      <motion.article
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="group flex h-full flex-col overflow-hidden rounded-card border bg-surface transition-shadow duration-500 ease-premium hover:shadow-elevated"
      >
        <Link href={href} className="flex flex-1 flex-col text-left" aria-label={`${product.name}: view product`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            <Image
              {...photoProps(product.image)}
              alt={product.image.alt}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 78vw"
              className="object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.06]"
            />
            <span className="absolute top-3 left-3 rounded-md bg-background/90 px-2 py-0.5 text-xs font-semibold text-secondary-foreground backdrop-blur-sm">
              {product.category}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="flex items-baseline gap-2">
              <span className="font-display text-[22px] leading-tight font-medium">{product.name}</span>
              {product.localName && <span className="text-sm italic text-muted-foreground">{product.localName}</span>}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{product.summary}</p>
            <dl className="mt-3 divide-y border-y text-sm">
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">Harvest</dt>
                <dd className="font-semibold">
                  {season[0]}
                  {season.length > 1 && `–${season[season.length - 1]}`}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">Forms</dt>
                <dd className="text-right font-semibold">{product.forms.join(" · ")}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <MonthBar harvest={product.harvest} />
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <Link href={href} className="text-sm font-semibold text-primary hover:underline">
            View product
          </Link>
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => (added ? quote.open() : quote.add(product.slug))}
            aria-label={added ? `${product.name} is in your enquiry` : `Add ${product.name} to enquiry`}
            className={`flex h-9 items-center gap-1.5 rounded-control px-3 text-sm font-semibold transition-colors ${
              added ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground hover:bg-accent-hover"
            }`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={String(added)}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                {added ? <CheckIcon size={16} weight="bold" /> : <PlusIcon size={16} weight="bold" />}
              </motion.span>
            </AnimatePresence>
            {added ? "Added" : "Enquire"}
          </motion.button>
        </div>
      </motion.article>
    </motion.li>
  );
}

// Closes the grid: a prompt for anything not listed.
function EnquiryTile() {
  const quote = useQuote();
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-[78%] shrink-0 sm:w-[46%] md:w-auto"
    >
      <div className="flex h-full min-h-64 flex-col justify-between rounded-card bg-inverse p-5 text-inverse-foreground">
        <div>
          <p className="font-display text-2xl leading-tight font-medium">Need a product or grade not listed?</p>
          <p className="mt-2 text-sm text-inverse-foreground/75">Tell us what you&apos;re sourcing and in what volume.</p>
        </div>
        <button type="button" onClick={() => quote.open()} className={`${button("accent", "md")} mt-5 w-full`}>
          <BasketIcon size={20} weight="duotone" />
          Send an enquiry
        </button>
      </div>
    </motion.li>
  );
}
