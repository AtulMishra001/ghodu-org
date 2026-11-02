"use client";

import type { Product } from "@/data/products";
import { months } from "@/data/site";
import { monthsToHarvest } from "@/lib/catalogue";
import { seasonLabel } from "@/lib/season";
import { useMonth } from "@/lib/use-month";
import { keyFacts, ON_REQUEST } from "./facts";

// The phone's first tab, sized to fit one screen: what it is, the terms a buyer
// checks first, and the harvest year. Desktop shows these in the hero instead.
export default function ProductOverview({ product }: { product: Product }) {
  const month = useMonth();
  const until = monthsToHarvest(product.harvest, month);

  return (
    <div className="px-4 pt-3 pb-4 md:hidden">
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{product.summary}</p>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        {keyFacts(product).map((f) => (
          <div key={f.label} className="flex min-w-0 items-center gap-2.5 rounded-tile border px-2.5 py-2">
            <f.icon size={20} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <dt className="truncate text-[11px] text-muted-foreground">{f.label}</dt>
              <dd className={`truncate text-sm font-semibold ${f.value === ON_REQUEST ? "font-normal text-muted-foreground" : ""}`}>{f.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-3">
        <p className="flex items-baseline justify-between gap-3 text-xs">
          <span className="font-semibold">Harvest {seasonLabel(product.harvest)}</span>
          {until !== null && <span className="text-muted-foreground">{until === 0 ? "In season now" : `Next in ${until} month${until === 1 ? "" : "s"}`}</span>}
        </p>
        <ol className="mt-1.5 grid grid-cols-12 gap-0.5" aria-label={`Harvest months: ${seasonLabel(product.harvest)}`}>
          {months.map((m, i) => (
            <li
              key={m}
              aria-current={i === month ? "date" : undefined}
              className={`grid h-7 place-items-center rounded-[5px] text-[10px] font-semibold ${
                product.harvest.includes(i) ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"
              } ${i === month ? "ring-2 ring-accent ring-inset" : ""}`}
            >
              {m.slice(0, 1)}
              <span className="sr-only">{m.slice(1)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
