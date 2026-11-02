"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CaretRightIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import Thumb from "@/components/shared/Thumb";
import type { Product } from "@/data/products";
import { months } from "@/data/site";
import { harvestStatus } from "@/lib/catalogue";
import AddButton from "./AddButton";
import { useCatalogue } from "./CatalogueProvider";

// The buyer's view: every product as a spec row, harvest months side by side
// so seasons can be compared at a glance. A table on desktop, a list on phones.
export default function ProductTable({ products }: { products: Product[] }) {
  const { month } = useCatalogue();
  const router = useRouter();
  const href = (p: Product) => `/products/${p.slug}`;

  return (
    <>
      <div className="hidden overflow-hidden rounded-card border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th scope="col" className="py-3 pr-4 pl-5 font-semibold">Product</th>
              <th scope="col" className="hidden px-4 font-semibold lg:table-cell">Line</th>
              <th scope="col" className="px-4 font-semibold">Forms</th>
              <th scope="col" className="w-[34%] px-4 font-semibold">
                <span className="sr-only">Harvest calendar</span>
                <span aria-hidden className="grid grid-cols-12 gap-1 text-center tracking-normal normal-case">
                  {months.map((m, i) => (
                    <span
                      key={m}
                      className={`rounded py-0.5 ${i === month ? "bg-accent font-bold text-accent-foreground" : ""}`}
                    >
                      {m[0]}
                    </span>
                  ))}
                </span>
              </th>
              <th scope="col" className="px-4 font-semibold">Harvest</th>
              <th scope="col" className="py-3 pr-5 pl-4 text-right font-semibold">
                <span className="sr-only">Enquiry</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence initial={false}>
              {products.map((p) => {
                const status = harvestStatus(p.harvest, month);
                return (
                  <motion.tr
                    key={p.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => router.push(href(p))}
                    className="group cursor-pointer bg-surface transition-colors hover:bg-surface-muted/60"
                  >
                    <td className="py-3 pr-4 pl-5">
                      <div className="flex items-center gap-3.5">
                        <Thumb photo={p.image} className="size-14 rounded-tile" sizes="56px" />
                        <div className="min-w-0">
                          <Link href={href(p)} onClick={(e) => e.stopPropagation()} className="flex items-baseline gap-2 text-left">
                            <span className="font-display text-xl font-medium group-hover:text-primary">{p.name}</span>
                            {p.localName && <span className="text-sm italic text-muted-foreground">{p.localName}</span>}
                          </Link>
                          <p className="text-xs text-muted-foreground">{p.kind}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 lg:table-cell">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 font-semibold">{p.forms.join(", ")}</td>
                    <td className="px-4">
                      <span aria-label={`Harvest: ${p.harvest.map((m) => months[m]).join(", ")}`} className="grid grid-cols-12 gap-1">
                        {months.map((m, i) => (
                          <span
                            key={m}
                            className={`h-6 rounded-sm transition-colors ${p.harvest.includes(i) ? "bg-primary" : "bg-surface-muted group-hover:bg-border/70"} ${
                              i === month ? "outline-2 outline-offset-1 outline-accent" : ""
                            }`}
                          />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <span className={`font-semibold ${status.now ? "text-primary" : ""}`}>{status.label}</span>
                    </td>
                    <td className="py-3 pr-5 pl-4">
                      <div className="flex justify-end">
                        <AddButton product={p} />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* phones: one row per product, like a native list */}
      <ul className="divide-y rounded-card border md:hidden">
        <AnimatePresence initial={false}>
          {products.map((p) => {
            const status = harvestStatus(p.harvest, month);
            return (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3"
              >
                <Link href={href(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-70">
                  <Thumb photo={p.image} className="size-16 rounded-tile" sizes="64px" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className="truncate font-display text-lg leading-tight font-medium">{p.name}</span>
                      {p.localName && <span className="truncate text-xs italic text-muted-foreground">{p.localName}</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.forms.join(" · ")} · <span className={status.now ? "font-semibold text-primary" : ""}>{status.label}</span>
                    </span>
                    <span className="mt-2 block">
                      <MonthBar harvest={p.harvest} highlight={month} />
                    </span>
                  </span>
                  <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" />
                </Link>
                <AddButton product={p} round />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </>
  );
}
