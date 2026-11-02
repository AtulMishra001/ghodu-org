"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import type { ProductCategory } from "@/data/products";
import { haptic } from "@/lib/haptics";
import { container } from "@/lib/ui";
import {
  CategoryTabs,
  SearchField,
  SeasonToggle,
  SortSelect,
  ViewToggle,
} from "./CatalogueControls";
import { useCatalogue } from "./CatalogueProvider";
import FilterSheet from "./FilterSheet";

// Sticks under the app bar while browsing. One row on desktop;
// search + filter button, then the category tabs, on phones.
export default function CatalogueToolbar({
  categories,
}: {
  categories: ProductCategory[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { activeFilters } = useCatalogue();

  return (
    <>
      <div className="sticky top-14 z-30 border-b bg-background/92 backdrop-blur-md md:top-[72px]">
        <div
          className={`${container} flex flex-col gap-2.5 py-2.5 md:flex-row md:items-center md:gap-3 md:py-3`}
        >
          <CategoryTabs categories={categories} />

          <div className="order-first flex items-center gap-2 md:order-none md:ml-auto md:gap-3">
            <SearchField />
            <button
              type="button"
              onClick={() => {
                haptic(5);
                setSheetOpen(true);
              }}
              aria-label={`Sort and filter${activeFilters ? ` (${activeFilters} on)` : ""}`}
              className="relative grid size-11 shrink-0 place-items-center rounded-control border bg-surface transition active:scale-90 md:hidden"
            >
              <SlidersHorizontalIcon size={20} />
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground tabular">
                  {activeFilters}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-3 md:flex">
              <SeasonToggle />
              <SortSelect />
              <ViewToggle />
            </div>
          </div>
        </div>
      </div>
      {/* outside the toolbar: its backdrop blur would trap the fixed sheet */}
      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
