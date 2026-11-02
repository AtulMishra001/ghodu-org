"use client";

import { motion } from "motion/react";
import { monthNames, months } from "@/data/site";

// Twelve month toggles for the harvest season.
export default function HarvestPicker({ value, onChange }: { value: number[]; onChange: (months: number[]) => void }) {
  const toggle = (m: number) => onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m].sort((a, b) => a - b));

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
      {months.map((m, i) => {
        const on = value.includes(i);
        return (
          <motion.button
            key={m}
            type="button"
            whileTap={{ scale: 0.9 }}
            aria-pressed={on}
            aria-label={monthNames[i]}
            onClick={() => toggle(i)}
            className={`flex h-12 flex-col items-center justify-center rounded-control border text-sm font-semibold transition-colors ${
              on ? "border-primary bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {m}
          </motion.button>
        );
      })}
    </div>
  );
}
