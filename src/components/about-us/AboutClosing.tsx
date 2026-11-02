"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRightIcon, BasketIcon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import Section from "@/components/shared/Section";
import type { AboutContent } from "@/data/about";
import type { Photo } from "@/data/photos";
import { button } from "@/lib/ui";
import { photoProps } from "@/lib/photo";

// Three columns of produce slide past each other as the page reaches its end.
export default function AboutClosing({ closing }: Pick<AboutContent, "closing">) {
  const quote = useQuote();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <Section className="pb-8 md:pb-10">
      <div ref={ref} className="grid overflow-hidden rounded-card bg-inverse text-inverse-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col justify-center p-5 md:p-10">
          <h2 className="font-display text-[32px] leading-[1.08] font-medium tracking-tight md:text-[48px] xl:text-[64px]">
            {closing.titleStart} <span className="italic text-accent">{closing.titleAccent}</span>
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-inverse-foreground/85 md:text-lg">{closing.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2 md:mt-6 md:gap-3">
            <button type="button" onClick={() => quote.open()} className={button("accent", "lg")}>
              <BasketIcon size={20} weight="duotone" />
              Start an enquiry
            </button>
            <Link href="/products" className={button("outline-inverse", "lg")}>
              View catalogue
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>

        <div aria-hidden className="grid h-64 grid-cols-3 gap-2 overflow-hidden px-2 md:h-96 lg:h-[560px] xl:h-[640px]">
          {closing.columns.map((column, i) => (
            <PhotoColumn key={i} photos={column} reverse={i % 2 === 1} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function PhotoColumn({
  photos,
  reverse,
  progress,
}: {
  photos: Photo[];
  reverse: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(progress, [0, 1], reverse ? ["-32%", "-4%"] : ["-4%", "-32%"]);

  return (
    <motion.div style={{ y }} className="flex flex-col gap-2 motion-reduce:[transform:translateY(-18%)]!">
      {photos.map((photo, i) => (
        <div key={i} className="relative aspect-[4/5] shrink-0 overflow-hidden rounded-tile">
          <Image {...photoProps(photo)} alt="" fill sizes="(min-width: 1024px) 18vw, 33vw" className="object-cover" />
        </div>
      ))}
    </motion.div>
  );
}
