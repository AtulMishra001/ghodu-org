"use client";

import Link from "next/link";
import { BasketIcon, ChatCircleIcon, CheckIcon, MagnifyingGlassPlusIcon, QuestionIcon } from "@phosphor-icons/react";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { useQuote } from "@/components/shared/QuoteProvider";
import SheetRow from "@/components/shared/SheetRow";
import type { Catalogue } from "@/data/catalogue";
import { button } from "@/lib/ui";

// Phone only, under the grid: the catalogue's help as two rows, so the shelf
// stays the whole page and the reading opens on request.
export default function CatalogueHelp({ faqs, sourcing }: Pick<Catalogue, "faqs" | "sourcing">) {
  const quote = useQuote();
  return (
    <section aria-label="Help with your enquiry" className="mx-4 mt-3 mb-4 divide-y border-y md:hidden">
      <SheetRow icon={<MagnifyingGlassPlusIcon size={22} weight="duotone" />} title={sourcing.title} hint="Tell us the product, grade and volume">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-[15px] leading-relaxed text-muted-foreground">{sourcing.body}</p>
          <ul className="flex flex-col gap-2">
            {sourcing.notes.map((n) => (
              <li key={n} className="flex items-center gap-2 text-sm font-semibold">
                <CheckIcon size={16} weight="bold" className="shrink-0 text-primary" />
                {n}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => quote.open()} className={`${button("primary", "md")} px-3`}>
              <BasketIcon size={20} weight="duotone" />
              Send a request
            </button>
            <Link href="/contact" className={`${button("outline", "md")} px-3`}>
              <ChatCircleIcon size={20} />
              Talk to us
            </Link>
          </div>
        </div>
      </SheetRow>
      <SheetRow icon={<QuestionIcon size={22} weight="duotone" />} title="Before you enquire" hint={`${faqs.length} common questions`}>
        <FaqAccordion faqs={faqs} />
      </SheetRow>
    </section>
  );
}
