"use client";

import { AnimatePresence, motion } from "motion/react";
import { BasketIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { monthNames } from "@/data/site";
import { sortLabels } from "@/lib/catalogue";
import { button, container } from "@/lib/ui";
import { useCatalogue } from "./CatalogueProvider";
import ProductTable from "./ProductTable";
import ProductTile from "./ProductTile";

export default function CatalogueResults() {
  const { shown, products, category, query, inSeason, sort, month, view, reset } = useCatalogue();
  const filtered = shown.length !== products.length || sort !== "featured";

  // Plain-language summary of what's on screen, e.g. "5 of 7 · Crops · harvesting in October".
  const parts = [
    category !== "All" && category,
    query.trim() && `“${query.trim()}”`,
    inSeason && month !== null && `harvesting in ${monthNames[month]}`,
    sort !== "featured" && `sorted by ${sortLabels[sort].toLowerCase()}`,
  ].filter(Boolean);

  return (
    <div className={`${container} pt-1.5 md:pt-5`}>
      <div className="flex min-h-8 items-center justify-between gap-3 text-sm">
        <p className="truncate text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground tabular">
            {shown.length === products.length ? `All ${products.length}` : `${shown.length} of ${products.length}`}
          </span>{" "}
          products{parts.length > 0 && ` · ${parts.join(" · ")}`}
        </p>
        <AnimatePresence>
          {filtered && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={reset}
              className="shrink-0 font-semibold text-primary hover:underline"
            >
              Clear all
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-1 md:mt-3">
        {shown.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {view === "grid" ? (
                <motion.ul layout className="grid grid-cols-2 gap-x-2.5 gap-y-3 md:grid-cols-3 md:gap-x-4 md:gap-y-7 xl:grid-cols-4 2xl:grid-cols-5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {shown.map((p, i) => (
                      <ProductTile key={p.slug} product={p} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                <ProductTable products={shown} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const { query, reset } = useCatalogue();
  const quote = useQuote();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-card border border-dashed px-6 py-10 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-surface-muted text-primary">
        <MagnifyingGlassIcon size={26} weight="duotone" />
      </span>
      <p className="mt-4 font-display text-2xl font-medium">
        {query.trim() ? `Nothing matches “${query.trim()}”` : "Nothing matches these filters"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try a broader search — or tell us what you&apos;re sourcing and we&apos;ll check what the valley has this season.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={button("outline", "md")}>
          Clear filters
        </button>
        <button type="button" onClick={() => quote.open()} className={button("primary", "md")}>
          <BasketIcon size={20} weight="duotone" />
          Ask us to source it
        </button>
      </div>
    </motion.div>
  );
}
