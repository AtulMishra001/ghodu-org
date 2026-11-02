"use client";

import { BasketIcon, CheckCircleIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { availabilityLabels, formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";
import { button } from "@/lib/ui";
import { whatsappLink } from "./facts";

// Phone only: the screen's one action, always in reach. Sticky rather than fixed,
// so it stays put while the page transition slides this screen in.
export default function ProductDock({ product }: { product: Product }) {
  const quote = useQuote();
  const added = quote.has(product.slug);
  const whatsapp = whatsappLink(product);
  const o = product.ordering;

  return (
    <div className="sticky bottom-0 z-20 border-t bg-background shadow-float md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="Ask on WhatsApp" className={`${button("outline", "md")} w-12 shrink-0 px-0!`}>
            <WhatsappLogoIcon size={22} />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-semibold">{o?.moq ? `Min. ${formatQuantity(o.moq)}` : "Quantity on request"}</p>
          {o && <p className="truncate text-xs text-muted-foreground">{availabilityLabels[o.availability]}</p>}
        </div>
        <button
          type="button"
          onClick={() => (added ? quote.open() : quote.open(product.slug))}
          className={`${button(added ? "outline" : "primary", "md")} shrink-0 px-4!`}
        >
          {added ? <CheckCircleIcon size={20} weight="fill" className="text-primary" /> : <BasketIcon size={20} weight="duotone" />}
          {added ? "Review enquiry" : "Request a quote"}
        </button>
      </div>
    </div>
  );
}

/** For the FAQ tab: the inline enquiry form it points to on desktop is a sheet on phones. */
export function AskButton({ slug }: { slug: string }) {
  const quote = useQuote();
  return (
    <button type="button" onClick={() => quote.open(slug)} className="mt-3 text-sm font-semibold text-primary">
      Ask something else
    </button>
  );
}
