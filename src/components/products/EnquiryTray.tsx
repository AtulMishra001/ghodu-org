"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import Thumb from "@/components/shared/Thumb";
import { useCatalogue } from "./CatalogueProvider";

// Floating tray that appears once something is in the enquiry — the
// "cart bar" of a shopping app. Sits above the tab bar on phones.
export default function EnquiryTray() {
  const { products } = useCatalogue();
  const quote = useQuote();
  const picked = products.filter((p) => quote.has(p.slug));

  return (
    <>
      {/* keeps the tray from covering the end of the page */}
      {picked.length > 0 && <div aria-hidden className="h-20" />}
      {/* lifts toasts above the tray while it's showing */}
      {picked.length > 0 && <style>{":root{--toast-lift:4.5rem}"}</style>}
      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ bottom: "calc(var(--tray-offset) + env(safe-area-inset-bottom))" }}
            className="fixed inset-x-3 z-30 [--tray-offset:calc(var(--tabbar-h)+0.5rem)] md:inset-x-auto md:left-1/2 md:z-40 md:w-[min(560px,calc(100%-3rem))] md:-translate-x-1/2 md:[--tray-offset:1.5rem]"
          >
            <button
              type="button"
              onClick={() => quote.open()}
              className="flex w-full items-center gap-3 rounded-card bg-inverse p-2 pr-3 text-left text-inverse-foreground shadow-float transition-transform active:scale-[0.98]"
            >
              <span className="flex shrink-0 -space-x-3 pl-1">
                <AnimatePresence initial={false}>
                  {picked.slice(0, 3).map((p) => (
                    <motion.span
                      key={p.slug}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 26 }}
                      className="rounded-full ring-2 ring-inverse"
                    >
                      <Thumb photo={p.image} className="size-10 rounded-full" sizes="40px" />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold tabular">
                  {picked.length} product{picked.length > 1 ? "s" : ""} in your enquiry
                </span>
                <span className="block truncate text-xs text-inverse-foreground/70">{picked.map((p) => p.name).join(", ")}</span>
              </span>
              <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-control bg-accent px-3.5 text-sm font-semibold text-accent-foreground">
                Review
                <ArrowRightIcon size={16} weight="bold" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
