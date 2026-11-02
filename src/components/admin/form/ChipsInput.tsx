"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";

// A list of short values as removable chips ("Kernels", "Pan-India"…).
// Type and press Enter or comma, or tap a suggestion.
export default function ChipsInput({
  id,
  value,
  onChange,
  suggestions = [],
  max,
  maxLength,
  placeholder,
  addLabel,
  invalid,
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  max: number;
  maxLength: number;
  placeholder: string;
  addLabel: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  function add(raw: string) {
    const item = raw.trim().slice(0, maxLength);
    if (!item || full || value.some((v) => v.toLowerCase() === item.toLowerCase())) return;
    onChange([...value, item]);
    setDraft("");
  }

  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <div
        className={`flex min-h-12 flex-wrap items-center gap-1.5 rounded-control border bg-surface p-1.5 transition-colors focus-within:border-primary ${
          invalid ? "border-red-400" : ""
        }`}
      >
        <AnimatePresence initial={false}>
          {value.map((v) => (
            <motion.span
              key={v}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-8 items-center gap-1 rounded-md bg-secondary pr-1 pl-2.5 text-sm font-semibold text-secondary-foreground"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
                className="grid size-6 place-items-center rounded hover:bg-background/60"
              >
                <XIcon size={12} weight="bold" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {!full && (
          <input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(draft);
              } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
            }}
            onBlur={() => add(draft)}
            placeholder={value.length ? "Add another…" : placeholder}
            aria-label={addLabel}
            maxLength={maxLength}
            className="h-8 min-w-36 flex-1 bg-transparent px-1.5 text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
        )}
      </div>
      {unused.length > 0 && !full && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              <PlusIcon size={11} weight="bold" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
