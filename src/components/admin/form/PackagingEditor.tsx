"use client";

import { AnimatePresence, motion } from "motion/react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { quantityUnits, type QuantityUnit } from "@/data/ordering";
import { limits } from "@/lib/product-input";
import { field } from "../styles";

type Pack = { label: string; value: string; unit: QuantityUnit };

// Packing options: what it comes in, and how much each holds.
export default function PackagingEditor({ value, onChange, invalid }: { value: Pack[]; onChange: (packs: Pack[]) => void; invalid?: boolean }) {
  const set = (i: number, patch: Partial<Pack>) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div>
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {value.map((p, i) => (
              <motion.li
                key={i}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <input
                  value={p.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  maxLength={limits.packLabel}
                  placeholder="e.g. Vacuum-packed carton"
                  aria-label={`Packing option ${i + 1}`}
                  aria-invalid={invalid}
                  className={`${field} col-span-2 h-11 min-w-0 sm:col-span-1`}
                />
                <QuantityField
                  value={p.value}
                  unit={p.unit}
                  onValue={(v) => set(i, { value: v })}
                  onUnit={(u) => set(i, { unit: u })}
                  label={`Size of packing option ${i + 1}`}
                  invalid={invalid}
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove packing option ${p.label || i + 1}`}
                  className="grid size-11 place-items-center rounded-control text-muted-foreground transition hover:bg-red-50 hover:text-red-700"
                >
                  <XIcon size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {value.length < limits.packaging && (
        <button
          type="button"
          onClick={() => onChange([...value, { label: "", value: "", unit: "kg" }])}
          className={`flex h-8 items-center gap-1 rounded-full border border-primary/40 px-3 text-xs font-semibold text-primary transition hover:bg-primary/5 ${value.length ? "mt-3" : ""}`}
        >
          <PlusIcon size={12} weight="bold" />
          Add a packing option
        </button>
      )}
    </div>
  );
}

/** Number + unit picker in one control, e.g. [ 25 ][ kg ▾ ]. */
export function QuantityField({
  id,
  value,
  unit,
  onValue,
  onUnit,
  label,
  invalid,
  placeholder = "25",
}: {
  id?: string;
  value: string;
  unit: QuantityUnit;
  onValue: (v: string) => void;
  onUnit: (u: QuantityUnit) => void;
  label: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={`flex h-11 items-center overflow-hidden rounded-control border bg-surface transition-colors focus-within:border-primary ${invalid ? "border-red-400" : ""}`}>
      <input
        id={id}
        value={value}
        onChange={(e) => onValue(e.target.value.replace(/[^\d.]/g, ""))}
        inputMode="decimal"
        placeholder={placeholder}
        aria-label={label}
        className="h-full w-20 min-w-0 bg-transparent px-3 text-[15px] tabular outline-none placeholder:text-muted-foreground/70"
      />
      <select
        value={unit}
        onChange={(e) => onUnit(e.target.value as QuantityUnit)}
        aria-label={`${label}: unit`}
        className="h-full border-l bg-surface-muted/60 px-2 text-sm font-semibold outline-none"
      >
        {quantityUnits.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  );
}
