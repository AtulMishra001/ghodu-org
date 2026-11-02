"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { Sheet } from "@/components/shared/Sheet";
import { sortLabels, type SortKey } from "@/lib/catalogue";
import { haptic } from "@/lib/haptics";
import { button } from "@/lib/ui";
import { useCatalogue } from "./CatalogueProvider";
import { SeasonToggle, ViewToggle } from "./CatalogueControls";

// Phone-only: sort, season and view live in a bottom sheet instead of crowding the toolbar.
export default function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sort, setSort, shown, reset, activeFilters } = useCatalogue();

  return (
    <Sheet open={open} onClose={onClose} title="Sort and filter">
      <div className="flex flex-col gap-5 pb-2">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sort by</legend>
          <div className="divide-y rounded-card border">
            {(Object.keys(sortLabels) as SortKey[]).map((k) => {
              const active = k === sort;
              return (
                <label key={k} className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-[15px] font-semibold">
                  {sortLabels[k]}
                  <input
                    type="radio"
                    name="sort"
                    value={k}
                    checked={active}
                    onChange={() => {
                      haptic(5);
                      setSort(k);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-6 place-items-center rounded-full border transition-colors ${
                      active ? "border-primary bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {active && <CheckIcon size={14} weight="bold" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-card border px-4 py-3">
          <SeasonToggle block />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">View</p>
          <ViewToggle withLabels />
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            disabled={activeFilters === 0}
            onClick={() => {
              haptic(5);
              reset();
            }}
            className={`${button("outline", "lg")} disabled:opacity-40`}
          >
            Reset
          </button>
          <button type="button" onClick={onClose} className={button("primary", "lg")}>
            Show {shown.length} product{shown.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
