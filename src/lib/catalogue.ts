import type { Product, ProductCategory } from "@/data/products";
import { months } from "@/data/site";

export type CategoryFilter = "All" | ProductCategory;
export type SortKey = "featured" | "harvest" | "name";
export type ViewMode = "grid" | "table";

export const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  harvest: "Next harvest",
  name: "Name A–Z",
};

/** Months until the next harvest month (0 = harvesting now), or null without a known month. */
export function monthsToHarvest(harvest: number[], month: number | null) {
  if (month === null) return null;
  for (let d = 0; d < 12; d++) if (harvest.includes((month + d) % 12)) return d;
  return null;
}

/** "Harvesting now" / "Next: Sep" / "Sep–Oct" (before the month is known). */
export function harvestStatus(harvest: number[], month: number | null) {
  const d = monthsToHarvest(harvest, month);
  if (d === 0) return { now: true, label: "Harvesting now" };
  if (d !== null) return { now: false, label: `Next: ${months[(month! + d) % 12]}` };
  const first = months[harvest[0]];
  const last = months[harvest[harvest.length - 1]];
  return { now: false, label: harvest.length > 1 ? `${first}–${last}` : first };
}

function matches(p: Product, q: string) {
  if (!q) return true;
  const hay = [p.name, p.localName, p.category, p.kind, p.summary, ...p.forms].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

export function filterProducts(
  products: Product[],
  opts: { category: CategoryFilter; query: string; inSeason: boolean; sort: SortKey; month: number | null },
) {
  const list = products.filter(
    (p) =>
      (opts.category === "All" || p.category === opts.category) &&
      matches(p, opts.query.trim()) &&
      (!opts.inSeason || monthsToHarvest(p.harvest, opts.month) === 0),
  );

  if (opts.sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (opts.sort === "harvest") {
    const key = (p: Product) => monthsToHarvest(p.harvest, opts.month) ?? p.harvest[0];
    return [...list].sort((a, b) => key(a) - key(b));
  }
  return list;
}
