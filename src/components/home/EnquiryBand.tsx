"use client";

import Link from "next/link";
import { BasketIcon } from "@phosphor-icons/react";
import ParallaxPhoto from "@/components/shared/ParallaxPhoto";
import { useQuote } from "@/components/shared/QuoteProvider";
import Section from "@/components/shared/Section";
import type { Photo } from "@/data/photos";
import { button } from "@/lib/ui";

export default function EnquiryBand({ image }: { image: Photo }) {
  const quote = useQuote();
  return (
    <Section className="pb-8 md:pb-10">
      <div className="relative isolate overflow-hidden rounded-card bg-inverse text-inverse-foreground">
        <ParallaxPhoto photo={image} sizes="100vw" className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-inverse via-inverse/85 to-inverse/40" />
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:gap-8 md:p-10 xl:min-h-[320px]">
          <div className="max-w-xl">
            <h2 className="font-display text-[30px] leading-tight font-medium md:text-[44px] xl:text-[52px]">
              Buying for a <span className="italic text-accent">business</span>?
            </h2>
            <p className="mt-2 text-[15px] text-inverse-foreground/85 md:text-lg">
              Tell us the products and quantities you need. We&apos;ll come back with grade, packing and price.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:shrink-0 md:gap-3">
            <button type="button" onClick={() => quote.open()} className={button("accent", "lg")}>
              <BasketIcon size={20} weight="duotone" />
              Start an enquiry
            </button>
            <Link href="/contact" className={`${button("outline-inverse", "lg")} backdrop-blur-sm`}>
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
