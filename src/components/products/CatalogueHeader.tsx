"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowDownRightIcon, CheckIcon } from "@phosphor-icons/react";
import type { Catalogue } from "@/data/catalogue";
import { haptic } from "@/lib/haptics";
import { container } from "@/lib/ui";
import { useCatalogue } from "./CatalogueProvider";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;

// Editorial title row, then one large photo "door" per line of business.
// A door filters the catalogue below and scrolls to it.
export default function CatalogueHeader({ intro, categories }: Pick<Catalogue, "intro" | "categories">) {
  const { products, category, setCategory } = useCatalogue();

  function choose(name: (typeof categories)[number]["name"]) {
    haptic(6);
    setCategory(category === name ? "All" : name);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className={`${container} pt-4 md:pt-8`}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end md:gap-10">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            {intro.eyebrow}
            <span className="h-px w-6 bg-primary/40" />
            <span className="tabular text-muted-foreground">
              {products.length} products · {categories.length} lines
            </span>
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-2 max-w-3xl font-display text-[30px] leading-[1.05] font-medium tracking-tight text-balance md:text-[48px] xl:text-[56px]"
          >
            {intro.title}
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease }}
          className="max-w-xl text-sm leading-relaxed text-muted-foreground md:pb-2 md:text-base"
        >
          {intro.summary}
        </motion.p>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2.5 md:mt-8 md:gap-4">
        {categories.map((c, i) => {
          const items = products.filter((p) => p.category === c.name);
          const active = category === c.name;
          return (
            <motion.li
              key={c.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 + i * 0.08, ease }}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => choose(c.name)}
                className="group relative isolate flex h-32 w-full flex-col justify-end overflow-hidden rounded-card bg-inverse p-3.5 text-left text-inverse-foreground transition-transform duration-300 active:scale-[0.98] sm:h-52 md:h-64 md:p-6 xl:h-72"
              >
                <Image
                  {...photoProps(c.image)}
                  alt={c.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 50vw"
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="-z-20 object-cover transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/45 to-inverse/5 md:via-inverse/30" />
                <span
                  className={`absolute inset-0 rounded-card ring-inset transition-shadow duration-300 ${
                    active ? "ring-3 ring-accent" : "ring-0"
                  }`}
                />

                <span className="absolute top-3 right-3 flex items-center gap-1.5 md:top-5 md:right-5">
                  <span
                    className={`grid size-8 place-items-center rounded-full transition-colors duration-300 md:size-10 ${
                      active ? "bg-accent text-accent-foreground" : "bg-background/90 text-foreground group-hover:bg-accent"
                    }`}
                  >
                    {active ? (
                      <CheckIcon size={16} weight="bold" />
                    ) : (
                      <ArrowDownRightIcon size={16} weight="bold" className="transition-transform duration-300 group-hover:rotate-[-45deg]" />
                    )}
                  </span>
                </span>

                <span className="flex items-baseline gap-2">
                  <span className="font-display text-2xl leading-none font-medium md:text-4xl xl:text-[44px]">{c.name}</span>
                  <span className="text-xs font-semibold text-inverse-foreground/70 tabular md:text-sm">{items.length}</span>
                </span>
                <span className="mt-2 hidden max-w-md text-sm text-inverse-foreground/80 md:block">{c.blurb}</span>
                <span className="mt-2 flex flex-wrap gap-1 md:mt-4 md:gap-1.5">
                  {items.map((p, j) => (
                    <span
                      key={p.slug}
                      className={`${j >= 2 ? "hidden md:inline" : ""} rounded-full border border-inverse-foreground/25 bg-inverse/30 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm md:px-2.5 md:py-1 md:text-xs`}
                    >
                      {p.name}
                    </span>
                  ))}
                  {items.length > 2 && (
                    <span className="rounded-full bg-inverse-foreground/15 px-2 py-0.5 text-[11px] font-semibold md:hidden">
                      +{items.length - 2}
                    </span>
                  )}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
