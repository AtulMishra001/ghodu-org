"use client";

import Image from "next/image";
import Link from "next/link";
import { BasketIcon, ChatCircleIcon, CheckIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import type { Catalogue } from "@/data/catalogue";
import { button } from "@/lib/ui";
import { photoProps } from "@/lib/photo";

// Closes the catalogue: a route for anything that isn't listed.
export default function SourcingPanel({ sourcing }: Pick<Catalogue, "sourcing">) {
  const quote = useQuote();

  return (
    <Section>
      <Reveal>
        <div className="grid overflow-hidden rounded-card bg-inverse text-inverse-foreground md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center p-5 md:p-10">
            <h2 className="font-display text-[26px] leading-[1.1] font-medium tracking-tight text-balance md:text-[40px]">
              {sourcing.title}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] text-inverse-foreground/75 md:text-base">{sourcing.body}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {sourcing.notes.map((n) => (
                <li key={n} className="flex items-center gap-2.5 text-sm font-semibold md:text-[15px]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <CheckIcon size={13} weight="bold" />
                  </span>
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex md:mt-8 md:gap-3">
              <button type="button" onClick={() => quote.open()} className={`${button("accent", "lg")} px-4 sm:px-6`}>
                <BasketIcon size={20} weight="duotone" />
                Send a request
              </button>
              <Link href="/contact" className={`${button("outline-inverse", "lg")} px-4 sm:px-6`}>
                <ChatCircleIcon size={20} />
                Talk to us
              </Link>
            </div>
          </div>
          <div className="relative order-first h-44 md:order-none md:h-auto md:min-h-[380px]">
            <Image
              {...photoProps(sourcing.image)}
              alt={sourcing.image.alt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-inverse/60 to-transparent md:bg-linear-to-r md:from-inverse md:via-inverse/10 md:to-transparent" />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
