"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import type { Product } from "@/data/products";

// Add-to-enquiry toggle used by every catalogue layout. Once added, a tap opens the enquiry.
// `round` is the icon-only button that sits on a photo.
export default function AddButton({ product, round }: { product: Product; round?: boolean }) {
  const quote = useQuote();
  const added = quote.has(product.slug);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.86 }}
      onClick={(e) => {
        e.stopPropagation();
        if (added) quote.open();
        else quote.add(product.slug);
      }}
      aria-label={added ? `${product.name} is in your enquiry — review` : `Add ${product.name} to enquiry`}
      className={`relative flex shrink-0 items-center justify-center gap-1.5 font-semibold transition-colors duration-300 ${
        round ? "size-10 rounded-full shadow-elevated" : "h-9 rounded-control px-3 text-sm"
      } ${added ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent-hover"}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(added)}
          initial={{ scale: 0.3, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="grid place-items-center"
        >
          {added ? <CheckIcon size={round ? 18 : 16} weight="bold" /> : <PlusIcon size={round ? 18 : 16} weight="bold" />}
        </motion.span>
      </AnimatePresence>
      {!round && (added ? "Added" : "Enquire")}
    </motion.button>
  );
}
