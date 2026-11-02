"use client";

import type { RefObject } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { BasketIcon, CheckIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";

// Phone-only "buy bar": appears once the hero's enquiry buttons scroll out
// of view, and sits just above the tab bar, like a shopping app.
export default function StickyEnquiryBar({ product, watch }: { product: Product; watch: RefObject<HTMLElement | null> }) {
  const quote = useQuote();
  const inView = useInView(watch, { initial: true });
  const added = quote.has(product.slug);
  const moq = product.ordering?.moq;

  return (
    <AnimatePresence>
      {!inView && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{ bottom: "calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 0.5rem)" }}
          className="fixed inset-x-3 z-30 md:hidden"
        >
          <div className="flex items-center gap-3 rounded-card bg-inverse p-2 pl-4 text-inverse-foreground shadow-float">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="truncate text-xs text-inverse-foreground/70">{moq ? `MOQ ${formatQuantity(moq)}` : "MOQ on request"}</p>
            </div>
            <button
              type="button"
              onClick={() => (added ? quote.open() : quote.open(product.slug))}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-control bg-accent px-4 text-sm font-semibold text-accent-foreground active:scale-95"
            >
              {added ? <CheckIcon size={18} weight="bold" /> : <BasketIcon size={18} weight="duotone" />}
              {added ? "Review" : "Enquire"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
