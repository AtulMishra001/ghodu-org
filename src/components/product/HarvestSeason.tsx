"use client";

import { motion } from "motion/react";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product } from "@/data/products";
import { monthNames, months } from "@/data/site";
import { monthsToHarvest } from "@/lib/catalogue";
import { seasonLabel } from "@/lib/season";
import { useMonth } from "@/lib/use-month";

// The year as twelve blocks: harvest months filled, this month marked.
export default function HarvestSeason({ product }: { product: Product }) {
  const month = useMonth();
  const until = monthsToHarvest(product.harvest, month);
  const line =
    month === null
      ? `Harvested ${seasonLabel(product.harvest)}.`
      : until === 0
        ? `Harvesting now, in ${monthNames[month]}. Fresh-season stock is available to order.`
        : `Next harvest begins in ${monthNames[(month + until!) % 12]}, ${until} month${until === 1 ? "" : "s"} from now.`;

  return (
    <Section id="season">
      <SectionHeader index="04" kicker="Season" title="When it's harvested" summary={line} />
      <ol className="mt-5 grid grid-cols-6 gap-1.5 sm:grid-cols-12 md:gap-2" aria-label={`Harvest months: ${seasonLabel(product.harvest)}`}>
        {months.map((m, i) => {
          const on = product.harvest.includes(i);
          const now = i === month;
          return (
            <motion.li
              key={m}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className={`relative flex h-16 flex-col items-center justify-center rounded-tile text-sm font-semibold md:h-20 ${
                on ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"
              } ${now ? "ring-2 ring-accent ring-offset-2" : ""}`}
            >
              {m}
              {now && <span className="absolute -bottom-6 text-[11px] font-bold text-foreground">Now</span>}
            </motion.li>
          );
        })}
      </ol>
      <div className="h-6" aria-hidden />
    </Section>
  );
}
