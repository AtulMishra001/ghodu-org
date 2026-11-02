"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import Thumb from "@/components/shared/Thumb";
import { useToast } from "@/components/shared/Toast";
import type { ContactContent } from "@/data/contact";
import type { Product } from "@/data/products";
import { monthNames } from "@/data/site";
import { photoProps } from "@/lib/photo";
import { seasonLabel } from "@/lib/season";
import { useMonth } from "@/lib/use-month";
import { button } from "@/lib/ui";
import { useContactForm } from "./ContactProvider";

/** Where a crop is in its harvest window this month. */
function harvestStage(p: Product, month: number) {
  if (p.harvest.length === 1) return "This month only";
  if (p.harvest[0] === month) return "Just starting";
  if (p.harvest[p.harvest.length - 1] === month) return "Final month";
  return "In full harvest";
}

/** Months from now until a crop's next harvest begins. */
function monthsUntil(p: Product, month: number) {
  for (let d = 1; d <= 12; d++) {
    if (p.harvest.includes((month + d) % 12)) return d;
  }
  return 12;
}

// Worked out from each product's harvest months and the visitor's current date,
// so it's never out of date. Adding a crop here fills in the form above.
export default function SeasonWatch({ season }: Pick<ContactContent, "season">) {
  const month = useMonth();
  const { products, lines, status, goToForm } = useContactForm();

  const inHarvest = month === null ? [] : products.filter((p) => p.harvest.includes(month));
  const upcoming =
    month === null
      ? []
      : products
          .filter((p) => !p.harvest.includes(month))
          .map((p) => ({ product: p, away: monthsUntil(p, month) }))
          .sort((a, b) => a.away - b.away);
  const count = status === "idle" ? lines.length : 0;

  return (
    <Section id="season">
      <SectionHeader index="01" kicker="Harvest watch" title={season.title} summary={season.summary} />

      <div className="mt-5 grid gap-3 md:mt-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-4">
        {/* ---------- This month ---------- */}
        <div className="relative isolate flex min-h-80 flex-col overflow-hidden rounded-card bg-inverse p-5 text-inverse-foreground md:p-8 lg:min-h-[520px]">
          <Image {...photoProps(season.image)} alt={season.image.alt} fill sizes="(min-width: 1024px) 42vw, 100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/70 to-inverse/35" />

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">In harvest now</p>
          <motion.p
            key={month ?? "unknown"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: month === null ? 0 : 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-1 font-display text-[44px] leading-none font-medium md:text-[64px] xl:text-[80px]"
          >
            {month === null ? " " : monthNames[month]}
          </motion.p>

          <div className="mt-auto pt-6">
            {month !== null && inHarvest.length === 0 && (
              <p className="max-w-md text-[15px] leading-relaxed text-inverse-foreground/90 md:text-lg">
                Nothing is in harvest this month.
                {upcoming[0] && ` ${upcoming[0].product.name} is next, in ${monthNames[upcoming[0].product.harvest[0]]}.`}
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {inHarvest.map((p, i) => (
                <li key={p.slug}>
                  <Reveal delay={i * 0.06} className="flex items-center gap-3 rounded-tile border border-inverse-foreground/20 bg-inverse/50 p-2.5 backdrop-blur-sm">
                    <Thumb photo={p.image} className="size-12 rounded-lg" sizes="48px" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block text-sm text-inverse-foreground/80">{harvestStage(p, month as number)}</span>
                    </span>
                    <AddToggle product={p} inverse />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Coming up ---------- */}
        <div className="flex min-w-0 flex-col rounded-card border bg-surface p-4 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Coming up</p>
          <ul className="mt-1 flex-1 divide-y">
            {upcoming.map(({ product, away }, i) => (
              <li key={product.slug}>
                <Reveal delay={i * 0.05} className="flex items-center gap-3 py-3 md:gap-4">
                  <span className="w-16 shrink-0 md:w-24">
                    <span className="block font-display text-xl leading-none font-medium text-primary md:text-[28px]">{away === 1 ? "Next" : away}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{away === 1 ? "month" : "months away"}</span>
                  </span>
                  <Thumb photo={product.image} className="size-11 rounded-lg" sizes="44px" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold">{product.name}</span>
                      <span className="text-sm text-muted-foreground">{seasonLabel(product.harvest)}</span>
                    </span>
                    <span className="mt-2 block max-w-sm">
                      <MonthBar harvest={product.harvest} highlight={month} />
                    </span>
                  </span>
                  <AddToggle product={product} />
                </Reveal>
              </li>
            ))}
          </ul>

          <AnimatePresence initial={false}>
            {count > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <button type="button" onClick={goToForm} className={`${button("primary", "md")} mt-3 w-full`}>
                  <ArrowUpIcon size={18} />
                  Continue your enquiry ({count})
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

function AddToggle({ product, inverse }: { product: Product; inverse?: boolean }) {
  const { hasProduct, toggleProduct } = useContactForm();
  const toast = useToast();
  const added = hasProduct(product.slug);
  const idle = inverse ? "bg-accent text-accent-foreground hover:bg-accent-hover" : "bg-surface-muted text-foreground hover:bg-secondary";

  return (
    <button
      type="button"
      aria-pressed={added}
      aria-label={`${added ? "Remove" : "Add"} ${product.name} ${added ? "from" : "to"} your enquiry`}
      onClick={() => {
        toggleProduct(product.slug);
        toast(`${product.name} ${added ? "removed from" : "added to"} your enquiry`);
      }}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-95 ${
        added ? "bg-primary text-primary-foreground" : idle
      }`}
    >
      {added ? <CheckIcon size={16} weight="bold" /> : <PlusIcon size={16} weight="bold" />}
      <span className="hidden sm:inline">{added ? "Added" : "Add"}</span>
    </button>
  );
}
