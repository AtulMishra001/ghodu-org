"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowUpRightIcon, BasketIcon, ChatCircleIcon, ListChecksIcon, NewspaperIcon, QuestionIcon, SealCheckIcon } from "@phosphor-icons/react";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { useQuote } from "@/components/shared/QuoteProvider";
import { Sheet } from "@/components/shared/Sheet";
import type { HomeContent } from "@/data/home";
import type { Product } from "@/data/products";
import { monthNames, months } from "@/data/site";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";
import { useMonth } from "@/lib/use-month";

type Panel = "origin" | "steps" | "faqs" | null;

const ease = [0.22, 1, 0.36, 1] as const;

// Whether it's a link or a sheet trigger, every small tile looks and behaves the same.
const tile = "flex flex-col justify-between rounded-card p-3 text-left transition active:scale-[0.97]";
const plainTile = `${tile} min-h-24 border bg-surface`;

// The phone home screen: a dashboard of tiles rather than a stack of sections.
// Everything is one tap away and long reading opens in a sheet.
export default function HomeBento({
  hero,
  products,
  origin,
  steps,
  faqs,
}: Pick<HomeContent, "hero" | "products" | "origin" | "steps" | "faqs">) {
  const quote = useQuote();
  const [panel, setPanel] = useState<Panel>(null);
  const open = (next: Panel) => {
    haptic(5);
    setPanel(next);
  };
  const [topFact, secondFact] = origin.facts;

  const panels: Record<NonNullable<Panel>, string> = { origin: origin.title, steps: "Three steps from enquiry to dispatch", faqs: "What buyers ask first" };

  return (
    <section aria-label="Home" className="px-4 pt-1 pb-4 md:hidden">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="font-display text-[26px] leading-[1.1] font-medium tracking-tight text-balance"
      >
        {hero.titleStart} <span className="italic text-primary">{hero.titleAccent}</span> {hero.titleEnd}
      </motion.h1>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <HarvestTile products={products} />

        <button type="button" onClick={() => quote.open()} className={`${tile} min-h-24 bg-accent text-accent-foreground`}>
          <BasketIcon size={24} weight="duotone" />
          <span>
            <span className="block leading-tight font-semibold">Request a quote</span>
            <span className="text-xs">{quote.count ? `${quote.count} in your enquiry` : "Any quantity, one form"}</span>
          </span>
        </button>

        <Link href="/products" onClick={() => haptic(5)} className="relative isolate flex min-h-24 flex-col justify-end overflow-hidden rounded-card bg-inverse p-3 text-inverse-foreground transition active:scale-[0.97]">
          {products[0] && <Image {...photoProps(products[0].image)} alt="" fill sizes="50vw" className="-z-20 object-cover" />}
          <span className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/70 to-transparent" />
          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/90 text-foreground">
            <ArrowUpRightIcon size={14} weight="bold" />
          </span>
          <span className="leading-tight font-semibold">Catalogue</span>
          <span className="text-xs text-inverse-foreground/80">{products.length} products</span>
        </Link>

        {/* Peeks past the edge, so it reads as swipeable. */}
        <ul aria-label="Products" className="rail col-span-2 -mx-4 scroll-pl-4 gap-2 px-4">
          {products.map((p) => (
            <li key={p.slug} className="w-[22%] min-w-20 shrink-0">
              <Link href={`/products/${p.slug}`} onClick={() => haptic(5)} className="block transition active:scale-95">
                <span className="relative block aspect-square overflow-hidden rounded-tile bg-surface-muted">
                  <Image {...photoProps(p.image)} alt={p.image.alt} fill sizes="96px" className="object-cover" />
                </span>
                <span className="mt-1 block truncate text-xs font-semibold">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button type="button" onClick={() => open("origin")} className="relative isolate row-span-2 flex min-h-48 flex-col justify-end overflow-hidden rounded-card bg-inverse p-3 text-left text-inverse-foreground transition active:scale-[0.97]">
          <Image {...photoProps(origin.image)} alt={origin.image.alt} fill sizes="50vw" className="-z-20 object-cover" />
          <span className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/40 to-transparent" />
          <span className="font-display text-[22px] leading-tight font-medium">{origin.title}</span>
          <span className="mt-0.5 text-xs text-inverse-foreground/80">The valley, in numbers</span>
        </button>
        {[topFact, secondFact].filter(Boolean).map((fact) => (
          <button key={fact.label} type="button" onClick={() => open("origin")} className={`${tile} bg-surface-muted`}>
            <span className="font-display text-[26px] leading-none font-medium text-primary tabular">
              {fact.value.toLocaleString("en-IN")}
              {fact.suffix}
            </span>
            <span className="mt-1 line-clamp-3 text-[11px] leading-tight text-muted-foreground">{fact.label}</span>
          </button>
        ))}

        <button type="button" onClick={() => open("steps")} className={plainTile}>
          <ListChecksIcon size={24} weight="duotone" className="text-primary" />
          <span className="leading-tight font-semibold">How ordering works</span>
        </button>
        <button type="button" onClick={() => open("faqs")} className={plainTile}>
          <QuestionIcon size={24} weight="duotone" className="text-primary" />
          <span className="leading-tight font-semibold">What buyers ask first</span>
        </button>
        <Link href="/blogs" onClick={() => haptic(5)} className={plainTile}>
          <NewspaperIcon size={24} weight="duotone" className="text-primary" />
          <span className="leading-tight font-semibold">Buyer guides</span>
        </Link>
        <Link href="/contact" onClick={() => haptic(5)} className={plainTile}>
          <ChatCircleIcon size={24} weight="duotone" className="text-primary" />
          <span className="leading-tight font-semibold">Talk to us</span>
        </Link>
      </div>

      <Sheet open={panel !== null} onClose={() => setPanel(null)} title={panel ? panels[panel] : ""}>
        {panel === "origin" && (
          <div className="flex flex-col gap-4 pb-2">
            <p className="text-[15px] leading-relaxed text-muted-foreground">{origin.summary}</p>
            <ul className="divide-y border-y">
              {origin.facts.map((fact) => (
                <li key={fact.label} className="flex items-center gap-4 py-3">
                  <span className="w-24 shrink-0 font-display text-[26px] leading-none font-medium text-primary tabular">
                    {fact.value.toLocaleString("en-IN")}
                    {fact.suffix}
                  </span>
                  <span className="text-sm text-muted-foreground">{fact.label}</span>
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 text-sm">
              <SealCheckIcon size={20} weight="duotone" className="shrink-0 text-primary" />
              {origin.note}
            </p>
          </div>
        )}
        {panel === "steps" && (
          <ol className="flex flex-col gap-4 pb-2">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted font-display text-primary tabular">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{step.title}</span>
                  <span className="mt-0.5 block text-[15px] text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        {panel === "faqs" && <FaqAccordion faqs={faqs} />}
      </Sheet>
    </section>
  );
}

// The live widget: this month's harvest. Swipe, or tap a month along the bottom.
function HarvestTile({ products }: { products: Product[] }) {
  const now = useMonth();
  const [picked, setPicked] = useState<number | null>(null);
  const month = picked ?? now ?? 0;
  const inSeason = products.filter((p) => p.harvest.includes(month));
  const lead = inSeason[0];

  function go(next: number) {
    const m = (next + 12) % 12;
    if (m === month) return;
    haptic(5);
    setPicked(m);
  }

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -50 || info.velocity.x < -400) go(month + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(month - 1);
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.08}
      onDragEnd={onSwipe}
      className="relative isolate col-span-2 flex h-[13.5rem] touch-pan-y flex-col overflow-hidden rounded-card bg-inverse p-3 text-inverse-foreground"
    >
      <AnimatePresence initial={false}>
        {lead && (
          <motion.div key={lead.slug} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }} className="absolute inset-0 -z-20">
            <Image {...photoProps(lead.image)} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" className="pointer-events-none object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-inverse/75 via-inverse/30 to-inverse/90" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{month === now ? "Harvesting now" : "In harvest"}</p>
      <p className="font-display text-[28px] leading-tight font-medium">{monthNames[month]}</p>

      <div className="mt-auto">
        {inSeason.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {inSeason.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  onClick={() => haptic(5)}
                  className="flex h-8 items-center gap-1 rounded-control bg-background px-2.5 text-sm font-semibold text-foreground transition active:scale-95"
                >
                  {p.name}
                  <ArrowUpRightIcon size={13} weight="bold" className="text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-inverse-foreground/90">Nothing comes in this month. The orchards are resting.</p>
        )}

        <div role="group" aria-label="Choose a month" className="mt-2.5 grid grid-cols-12 gap-0.5">
          {months.map((m, i) => (
            <button
              key={m}
              type="button"
              aria-label={monthNames[i]}
              aria-pressed={i === month}
              onClick={() => go(i)}
              className={`h-7 rounded-[5px] text-[10px] font-semibold transition-colors ${
                i === month ? "bg-accent text-accent-foreground" : products.some((p) => p.harvest.includes(i)) ? "bg-inverse-foreground/25" : "bg-inverse-foreground/10 text-inverse-foreground/60"
              }`}
            >
              {m.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
