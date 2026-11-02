"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon, BasketIcon, CalendarCheckIcon, PackageIcon, SlidersHorizontalIcon, type Icon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import type { HomeContent } from "@/data/home";
import { button, container } from "@/lib/ui";
import HeroShowcase from "./HeroShowcase";

const ease = [0.22, 1, 0.36, 1] as const;

const capabilityIcons: Record<HomeContent["hero"]["capabilities"][number]["icon"], Icon> = {
  volume: PackageIcon,
  spec: SlidersHorizontalIcon,
  season: CalendarCheckIcon,
};

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

export default function Hero({ hero, products }: Pick<HomeContent, "hero" | "products">) {
  const quote = useQuote();
  const words = [hero.titleStart, hero.titleAccent, hero.titleEnd];

  return (
    <section className={`${container} pt-3 md:pt-6`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-10 xl:gap-10">
        {/* ---------- Left: the offer ---------- */}
        <div className="flex flex-col justify-center lg:py-6">
          <motion.p {...rise(0.05)} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-primary/50" />
            {hero.eyebrow}
          </motion.p>

          <h1 className="mt-3 font-display text-[36px] leading-[1.04] font-medium tracking-tight md:text-[52px] xl:text-[60px] 2xl:text-[76px]">
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12 + i * 0.12, ease }}
                className={`inline-block ${i === 1 ? "relative isolate italic text-primary" : ""}`}
              >
                {word}
                {i === 1 && (
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease }}
                    className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] origin-left rounded-sm bg-accent/70"
                  />
                )}
                {i < words.length - 1 && " "}
              </motion.span>
            ))}
          </h1>

          <motion.p {...rise(0.45)} className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
            {hero.summary}
          </motion.p>

          <motion.div {...rise(0.55)} className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:gap-3">
            <button type="button" onClick={() => quote.open()} className={`${button("primary", "lg")} px-4 sm:px-6`}>
              <BasketIcon size={20} weight="duotone" />
              <span className="sm:hidden">Get a quote</span>
              <span className="hidden sm:inline">Request a bulk quote</span>
            </button>
            <Link href="/products" className={`${button("outline", "lg")} px-4 sm:px-6`}>
              <span className="sm:hidden">Catalogue</span>
              <span className="hidden sm:inline">View catalogue</span>
              <ArrowRightIcon size={18} />
            </Link>
          </motion.div>

          <ul className="mt-8 hidden gap-4 border-t pt-6 sm:grid sm:grid-cols-3 md:mt-10">
            {hero.capabilities.map((c, i) => {
              const CapIcon = capabilityIcons[c.icon];
              return (
                <motion.li key={c.title} {...rise(0.65 + i * 0.08)} className="flex flex-col gap-2">
                  <span className="grid size-10 place-items-center rounded-tile bg-surface-muted text-primary">
                    <CapIcon size={22} weight="duotone" />
                  </span>
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    <span className="block text-sm text-muted-foreground">{c.body}</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* ---------- Right: interactive visual ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="min-w-0"
        >
          {products.length > 0 && <HeroShowcase products={products} />}
        </motion.div>
      </div>
    </section>
  );
}
