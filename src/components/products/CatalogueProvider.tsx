"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { filterProducts, type CategoryFilter, type SortKey, type ViewMode } from "@/lib/catalogue";
import { useMonth } from "@/lib/use-month";

type CatalogueState = {
  products: Product[];
  shown: Product[];
  month: number | null;
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  query: string;
  setQuery: (q: string) => void;
  inSeason: boolean;
  setInSeason: (v: boolean) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  /** Filters other than the category tabs that are switched on. */
  activeFilters: number;
  reset: () => void;
};

const CatalogueContext = createContext<CatalogueState | null>(null);

export function useCatalogue() {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error("useCatalogue must be used inside <CatalogueProvider>");
  return ctx;
}

// Holds the browse state (category, search, season, sort, view) so the header,
// toolbar and results stay in sync while each stays its own component.
export default function CatalogueProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const month = useMonth();
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  const [inSeason, setInSeason] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<ViewMode>("grid");

  const value = useMemo<CatalogueState>(() => {
    const shown = filterProducts(products, { category, query, inSeason, sort, month });
    return {
      products,
      shown,
      month,
      category,
      setCategory,
      query,
      setQuery,
      inSeason,
      setInSeason,
      sort,
      setSort,
      view,
      setView,
      activeFilters: (inSeason ? 1 : 0) + (sort !== "featured" ? 1 : 0),
      reset: () => {
        setCategory("All");
        setQuery("");
        setInSeason(false);
        setSort("featured");
      },
    };
  }, [products, category, query, inSeason, sort, view, month]);

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}
