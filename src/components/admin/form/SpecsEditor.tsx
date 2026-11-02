"use client";

import { AnimatePresence, motion } from "motion/react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { limits } from "@/lib/product-input";
import { field } from "../styles";

type Spec = { label: string; value: string };

// Common rows a buyer looks for, offered as one-tap starters.
const STARTERS = ["Grade", "Size", "Colour", "Moisture", "Shelf life", "Storage", "Certification"];

// Two-column spec table editor: name | value.
export default function SpecsEditor({ value, onChange, invalid }: { value: Spec[]; onChange: (specs: Spec[]) => void; invalid?: boolean }) {
  const full = value.length >= limits.specs;
  const set = (i: number, patch: Partial<Spec>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const unused = STARTERS.filter((s) => !value.some((v) => v.label.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {value.map((s, i) => (
              <motion.li
                key={i}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2"
              >
                <input
                  value={s.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  maxLength={limits.specLabel}
                  placeholder="e.g. Moisture"
                  aria-label={`Specification ${i + 1} name`}
                  aria-invalid={invalid && (!s.label || !s.value)}
                  className={`${field} h-11 min-w-0 font-semibold`}
                />
                <input
                  value={s.value}
                  onChange={(e) => set(i, { value: e.target.value })}
                  maxLength={limits.specValue}
                  placeholder="e.g. Below 8%"
                  aria-label={`Specification ${i + 1} value`}
                  aria-invalid={invalid && (!s.label || !s.value)}
                  className={`${field} h-11 min-w-0`}
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove specification ${s.label || i + 1}`}
                  className="grid size-11 place-items-center rounded-control text-muted-foreground transition hover:bg-red-50 hover:text-red-700"
                >
                  <XIcon size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {!full && (
        <div className={`flex flex-wrap gap-1.5 ${value.length ? "mt-3" : ""}`}>
          <button
            type="button"
            onClick={() => onChange([...value, { label: "", value: "" }])}
            className="flex h-8 items-center gap-1 rounded-full border border-primary/40 px-3 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            <PlusIcon size={12} weight="bold" />
            Add a row
          </button>
          {unused.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange([...value, { label, value: "" }])}
              className="flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              <PlusIcon size={11} weight="bold" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
