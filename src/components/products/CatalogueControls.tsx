"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CaretDownIcon, ListBulletsIcon, MagnifyingGlassIcon, SquaresFourIcon, XIcon } from "@phosphor-icons/react";
import type { ProductCategory } from "@/data/products";
import { monthNames } from "@/data/site";
import { sortLabels, type CategoryFilter, type SortKey, type ViewMode } from "@/lib/catalogue";
import { haptic } from "@/lib/haptics";
import { useCatalogue } from "./CatalogueProvider";

// The catalogue's individual controls, shared by the toolbar and the phone filter sheet.

export function CategoryTabs({ categories }: { categories: ProductCategory[] }) {
  const { products, category, setCategory } = useCatalogue();
  const tabs: CategoryFilter[] = ["All", ...categories];

  return (
    <div role="tablist" aria-label="Product line" className="grid grid-flow-col auto-cols-fr rounded-control bg-surface-muted p-1 md:auto-cols-auto">
      {tabs.map((t) => {
        const active = t === category;
        const count = t === "All" ? products.length : products.filter((p) => p.category === t).length;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (active) return;
              haptic(5);
              setCategory(t);
            }}
            className={`relative flex h-9 items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-0.25rem)] px-3 text-sm font-semibold transition-colors md:px-4 ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="catalogue-tab"
                className="absolute inset-0 rounded-[inherit] bg-surface shadow-card"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative whitespace-nowrap">{t}</span>
            <span className={`relative text-xs tabular ${active ? "text-primary" : "text-muted-foreground"}`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SearchField() {
  const { query, setQuery } = useCatalogue();
  const ref = useRef<HTMLInputElement>(null);

  // "/" jumps to search on desktop, as in most catalogue tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      ref.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <label className="group relative flex h-11 min-w-0 flex-1 items-center rounded-control border bg-surface transition-colors focus-within:border-primary md:h-10 md:w-64 md:flex-none xl:w-80">
      <span className="sr-only">Search products</span>
      <MagnifyingGlassIcon size={18} className="ml-3 shrink-0 text-muted-foreground" />
      <input
        ref={ref}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search walnuts, kernels, saffron…"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[15px] outline-none placeholder:text-muted-foreground/80 md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            ref.current?.focus();
          }}
          aria-label="Clear search"
          className="mr-1.5 grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-surface-muted active:scale-90"
        >
          <XIcon size={16} />
        </button>
      ) : (
        <kbd className="mr-2.5 hidden rounded border px-1.5 text-xs text-muted-foreground md:block">/</kbd>
      )}
    </label>
  );
}

export function SeasonToggle({ block }: { block?: boolean }) {
  const { inSeason, setInSeason, month } = useCatalogue();
  const disabled = month === null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={inSeason}
      disabled={disabled}
      onClick={() => {
        haptic(5);
        setInSeason(!inSeason);
      }}
      className={`flex items-center gap-2.5 text-sm font-semibold transition disabled:opacity-50 ${
        block ? "w-full justify-between py-1" : "h-10 rounded-control border bg-surface pr-3 pl-2.5 hover:border-foreground/30"
      }`}
    >
      <span className="text-left">
        Harvesting now
        {block && month !== null && (
          <span className="block text-sm font-normal text-muted-foreground">Only products in season in {monthNames[month]}</span>
        )}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${inSeason ? "bg-primary" : "bg-border"}`}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
          className={`absolute top-0.5 size-4 rounded-full bg-surface shadow-card ${inSeason ? "right-0.5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function SortSelect() {
  const { sort, setSort } = useCatalogue();
  return (
    <label className="relative flex h-10 items-center rounded-control border bg-surface text-sm font-semibold transition-colors hover:border-foreground/30">
      <span className="pl-3 font-normal text-muted-foreground">Sort</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="h-full appearance-none bg-transparent pr-8 pl-1.5 outline-none"
      >
        {(Object.keys(sortLabels) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {sortLabels[k]}
          </option>
        ))}
      </select>
      <CaretDownIcon size={14} className="pointer-events-none absolute right-3 text-muted-foreground" />
    </label>
  );
}

const views: { key: ViewMode; label: string; icon: typeof SquaresFourIcon }[] = [
  { key: "grid", label: "Grid", icon: SquaresFourIcon },
  { key: "table", label: "List", icon: ListBulletsIcon },
];

export function ViewToggle({ withLabels }: { withLabels?: boolean }) {
  const { view, setView } = useCatalogue();
  return (
    <div role="radiogroup" aria-label="View" className="flex rounded-control border bg-surface p-0.5">
      {views.map((v) => {
        const active = v.key === view;
        return (
          <button
            key={v.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${v.label} view`}
            onClick={() => {
              haptic(5);
              setView(v.key);
            }}
            className={`relative flex h-8 items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-0.2rem)] px-2.5 text-sm font-semibold transition-colors ${
              withLabels ? "flex-1" : ""
            } ${active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={withLabels ? "view-toggle-sheet" : "view-toggle"}
                className="absolute inset-0 rounded-[inherit] bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <v.icon size={18} weight={active ? "fill" : "regular"} className="relative" />
            {withLabels && <span className="relative">{v.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
