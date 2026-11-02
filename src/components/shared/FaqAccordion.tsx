"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRightIcon, PlusIcon } from "@phosphor-icons/react";
import type { PageFaq } from "@/lib/faq";
import { haptic } from "@/lib/haptics";

// One open at a time, the first open by default; clicking the open one closes it.
export default function FaqAccordion({ faqs }: { faqs: PageFaq[] }) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <ul className="border-t">
      {faqs.map((faq, i) => {
        const expanded = open === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <li key={i} className="border-b">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => {
                  haptic(5);
                  setOpen(expanded ? -1 : i);
                }}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="min-w-0 font-display text-xl leading-tight font-medium wrap-anywhere md:text-2xl">{faq.question}</span>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full transition-[background-color,color,rotate] duration-300 ease-premium ${expanded ? "rotate-45 bg-primary text-primary-foreground" : "bg-surface-muted"}`}>
                  <PlusIcon size={16} weight="bold" />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} inert={!expanded} className={`grid transition-[grid-template-rows] duration-500 ease-premium ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-3xl pb-4 text-[15px] leading-relaxed wrap-anywhere whitespace-pre-line text-muted-foreground md:text-base">{faq.answer}</p>
                {faq.link && (
                  <Link href={faq.link.href} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    {faq.link.label}
                    <ArrowRightIcon size={14} weight="bold" />
                  </Link>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
