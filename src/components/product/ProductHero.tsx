"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  BasketIcon,
  CaretRightIcon,
  CheckCircleIcon,
  TestTubeIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { availabilityLabels, type Availability } from "@/data/ordering";
import type { Product } from "@/data/products";
import { harvestStatus } from "@/lib/catalogue";
import { button, container } from "@/lib/ui";
import { useMonth } from "@/lib/use-month";
import { keyFacts, ON_REQUEST, whatsappLink } from "./facts";
import ProductGallery from "./ProductGallery";

const ease = [0.22, 1, 0.36, 1] as const;

const availabilityTone: Record<Availability, string> = {
  available: "bg-primary/10 text-primary",
  limited: "bg-accent/25 text-foreground",
  "pre-order": "bg-secondary text-secondary-foreground",
  unavailable: "bg-surface-muted text-muted-foreground",
};

export default function ProductHero({ product }: { product: Product }) {
  const quote = useQuote();
  const month = useMonth();
  const added = quote.has(product.slug);
  const o = product.ordering;
  const status = harvestStatus(product.harvest, month);
  const photos = [product.image, ...(product.gallery ?? [])];

  const facts = keyFacts(product);
  const whatsapp = whatsappLink(product);

  return (
    <section className={`${container} md:pt-4`}>
      <nav aria-label="Breadcrumb" className="mb-2.5 hidden md:block">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
          </li>
          <CaretRightIcon size={12} aria-hidden />
          <li>{product.category}</li>
          <CaretRightIcon size={12} aria-hidden />
          <li aria-current="page" className="font-semibold text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid md:gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        {/* edge-to-edge photo on phones; the title sheet below overlaps its bottom edge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          className="-mx-4 md:mx-0"
        >
          <ProductGallery photos={photos} name={product.name} />
        </motion.div>

        <div className="relative z-10 -mx-4 -mt-4 flex flex-col rounded-t-card bg-background px-4 pt-3.5 pb-2.5 md:mx-0 md:mt-0 md:rounded-none md:bg-transparent md:p-0 lg:justify-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary max-md:[@media(max-height:600px)]:hidden md:text-xs"
          >
            {product.category} · {product.kind}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-1 flex flex-wrap items-baseline gap-x-2.5 font-display text-[30px] leading-none font-medium tracking-tight md:text-[44px] xl:text-[52px]"
          >
            {product.name}
            {product.localName && <span className="text-base italic text-muted-foreground md:text-xl">{product.localName}</span>}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2"
          >
            {o && (
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold md:px-3 md:py-1.5 md:text-sm ${availabilityTone[o.availability]}`}>
                <CheckCircleIcon size={14} weight="fill" />
                {availabilityLabels[o.availability]}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold md:px-3 md:py-1.5 md:text-sm">
              {status.now ? (
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                  <span className="relative size-2 rounded-full bg-primary" />
                </span>
              ) : (
                <span className="size-2 rounded-full bg-accent" />
              )}
              {status.now ? "Harvesting now" : status.label.replace("Next:", "Next harvest:")}
            </span>
          </motion.div>

          {/* On phones these live in the Overview tab and the bottom dock. */}
          <div className="max-md:hidden">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base"
          >
            {product.summary}
          </motion.p>

          <motion.dl
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-4 grid grid-cols-2 overflow-hidden rounded-card border"
          >
            {facts.map((f, i) => (
              <div key={f.label} className={`flex gap-3 p-3 md:px-4 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t" : ""}`}>
                <f.icon size={22} className="mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className={`text-[15px] font-semibold ${f.value === ON_REQUEST ? "font-normal text-muted-foreground" : ""}`}>{f.value}</dd>
                </div>
              </div>
            ))}
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <p className="mr-1 text-sm font-semibold">Available as</p>
            <ul className="contents">
              {product.forms.map((f) => (
                <li key={f} className="rounded-control border bg-surface px-3 py-1.5 text-sm font-semibold">
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease }}
            className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap"
          >
            <button
              type="button"
              onClick={() => (added ? quote.open() : quote.open(product.slug))}
              className={`${button(added ? "outline" : "primary", "md")} sm:px-6`}
            >
              {added ? <CheckCircleIcon size={20} weight="fill" className="text-primary" /> : <BasketIcon size={20} weight="duotone" />}
              {added ? "In your enquiry — review" : "Add to bulk enquiry"}
            </button>
            {o?.samples?.available && (
              <button type="button" onClick={() => quote.open(product.slug)} className={button("outline", "md")}>
                <TestTubeIcon size={20} />
                Request a sample
              </button>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className={button("quiet", "md")}>
                <WhatsappLogoIcon size={20} />
                Ask on WhatsApp
              </a>
            )}
          </motion.div>
          {o?.samples?.available && o.samples.note && <p className="mt-2 text-sm text-muted-foreground">Samples: {o.samples.note}.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
