"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import MonthBar from "@/components/shared/MonthBar";
import Thumb from "@/components/shared/Thumb";
import ProductSheet from "@/components/shared/ProductSheet";
import SectionHeader from "@/components/shared/SectionHeader";
import Section from "@/components/shared/Section";
import type { Product } from "@/data/products";
import { monthNames, months } from "@/data/site";
import { haptic } from "@/lib/haptics";
import { useMonth } from "@/lib/use-month";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;

// Signature interaction: the valley's harvest year.
// Phone — swipe (or tap) through months; what's being harvested slides in.
// Desktop — a season chart; hover any month to light up what's in harvest.
export default function HarvestCalendar({ products }: { products: Product[] }) {
  const now = useMonth();
  const [picked, setPicked] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [open, setOpen] = useState<Product | null>(null);
  const month = picked ?? now ?? 0;
  const inSeason = products.filter((p) => p.harvest.includes(month));

  function go(next: number) {
    const m = (next + 12) % 12;
    if (m === month) return;
    haptic(5);
    setDir(next > month ? 1 : -1);
    setPicked(m);
  }

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 || info.velocity.x < -400) go(month + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(month - 1);
  }

  return (
    <Section id="harvest">
      <SectionHeader
        index="01"
        kicker="Harvest calendar"
        title={
          <>
            Plan around the <span className="italic text-primary">valley&apos;s</span> seasons
          </>
        }
        summary="Each crop comes off the trees and fields at its own time. Pick a month to see what's in harvest."
      />

      {/* ---------- Phone: month strip + swipeable list ---------- */}
      <div className="mt-5 md:hidden">
        <MonthStrip month={month} now={now} onPick={go} />
        <div className="mt-3 overflow-hidden rounded-card border bg-surface">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">In harvest</p>
              <p className="font-display text-xl font-medium">{monthNames[month]}</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => go(month - 1)}
                className="grid size-9 place-items-center rounded-full bg-surface-muted transition active:scale-90"
              >
                <CaretLeftIcon size={16} weight="bold" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => go(month + 1)}
                className="grid size-9 place-items-center rounded-full bg-surface-muted transition active:scale-90"
              >
                <CaretRightIcon size={16} weight="bold" />
              </button>
            </div>
          </div>
          <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={onSwipe} className="touch-pan-y">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.ul
                key={month}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 48, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -48, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease }}
                className="min-h-[148px] divide-y"
              >
                {inSeason.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nothing comes in this month — the orchards are resting.
                  </li>
                )}
                {inSeason.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        haptic(6);
                        setOpen(p);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-surface-muted"
                    >
                      <Thumb photo={p.image} className="size-14 rounded-tile" sizes="56px" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-semibold">{p.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{p.category}</span>
                        </span>
                        <span className="mt-2 block">
                          <MonthBar harvest={p.harvest} highlight={month} />
                        </span>
                      </span>
                      <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </motion.div>
          <p className="border-t px-4 py-2 text-center text-xs text-muted-foreground">Swipe to change month</p>
        </div>
      </div>

      {/* ---------- Desktop: season chart (+ photo of what's in harvest on wide screens) ---------- */}
      <div className="mt-6 hidden gap-4 md:grid xl:grid-cols-[minmax(0,1fr)_400px]">
        <SeasonChart products={products} month={month} now={now} onHover={go} onOpen={setOpen} />
        <SeasonFeature products={inSeason} month={month} onOpen={setOpen} />
      </div>

      <ProductSheet product={open} onClose={() => setOpen(null)} month={month} />
    </Section>
  );
}

function MonthStrip({ month, now, onPick }: { month: number; now: number | null; onPick: (m: number) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the chosen month centred — scroll the rail only, never the page.
  useEffect(() => {
    const el = refs.current[month];
    const box = rail.current;
    if (!el || !box) return;
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [month]);

  return (
    <div ref={rail} role="tablist" aria-label="Month" className="rail relative -mx-4 scroll-px-4 gap-1.5 px-4">
      {months.map((m, i) => {
        const active = i === month;
        return (
          <button
            key={m}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onPick(i)}
            className={`relative h-10 min-w-14 shrink-0 rounded-control px-3 text-sm font-semibold transition-colors ${
              active ? "text-primary-foreground" : "bg-surface-muted text-muted-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="month-thumb"
                className="absolute inset-0 rounded-control bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{m}</span>
            {now === i && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" aria-label="this month" />}
          </button>
        );
      })}
    </div>
  );
}

function SeasonChart({
  products,
  month,
  now,
  onHover,
  onOpen,
}: {
  products: Product[];
  month: number;
  now: number | null;
  onHover: (m: number) => void;
  onOpen: (p: Product) => void;
}) {
  const cols = "grid grid-cols-[200px_repeat(12,minmax(0,1fr))]";
  const inSeason = products.filter((p) => p.harvest.includes(month));

  return (
    <div className="rounded-card border bg-surface p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="font-display text-2xl font-medium">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={month}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="inline-block"
            >
              {monthNames[month]}
            </motion.span>
          </AnimatePresence>
        </p>
        <p className="text-sm text-muted-foreground">
          {inSeason.length ? `In harvest: ${inSeason.map((p) => p.name).join(", ")}` : "No harvest this month"}
        </p>
      </div>

      <div className="relative">
        {/* header row */}
        <div className={`${cols} border-b pb-2 text-xs font-semibold text-muted-foreground`}>
          <span>Product</span>
          {months.map((m, i) => (
            <button
              key={m}
              type="button"
              onMouseEnter={() => onHover(i)}
              onFocus={() => onHover(i)}
              onClick={() => onHover(i)}
              className={`relative text-center transition-colors ${i === month ? "text-foreground" : ""}`}
            >
              {m}
              {now === i && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-sm bg-accent px-1 text-[9px] font-bold uppercase text-accent-foreground">
                  Now
                </span>
              )}
            </button>
          ))}
        </div>

        {/* highlighted month column */}
        <div className={`${cols} pointer-events-none absolute inset-0`} aria-hidden>
          <span />
          {months.map((m, i) =>
            i === month ? (
              <motion.span
                key="col"
                layoutId="chart-col"
                className="rounded-md bg-surface-muted"
                style={{ gridColumn: i + 2 }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
              />
            ) : null,
          )}
        </div>

        {products.map((p, row) => {
          const active = p.harvest.includes(month);
          const start = p.harvest[0];
          const span = p.harvest.length;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => onOpen(p)}
              className={`${cols} group relative w-full items-center border-b py-2 text-left transition-opacity duration-300 last:border-0 ${
                active ? "opacity-100" : "opacity-45 hover:opacity-80"
              }`}
            >
              <span className="flex items-center gap-2.5 pr-3" style={{ gridColumn: 1, gridRow: 1 }}>
                <Thumb photo={p.image} className="size-10 rounded-tile transition-transform duration-500 ease-premium group-hover:scale-110" sizes="40px" />
                <span className="font-semibold">{p.name}</span>
              </span>
              {months.map((m, i) => (
                <span key={m} className="h-10" style={{ gridColumn: i + 2, gridRow: 1 }} onMouseEnter={() => onHover(i)} />
              ))}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: 0.1 + row * 0.06, ease }}
                style={{ gridColumn: `${start + 2} / span ${span}`, gridRow: 1 }}
                className={`pointer-events-none mx-1 h-7 origin-left self-center rounded-md ${active ? "bg-primary" : "bg-primary/35"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Wide screens: a large photo of the month's lead crop, cross-fading as the month changes.
function SeasonFeature({ products, month, onOpen }: { products: Product[]; month: number; onOpen: (p: Product) => void }) {
  const lead = products[0];
  return (
    <div className="relative hidden min-h-[420px] overflow-hidden rounded-card bg-inverse text-inverse-foreground xl:block">
      <AnimatePresence initial={false}>
        <motion.div
          key={lead?.slug ?? "rest"}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease }}
          className="absolute inset-0"
        >
          {lead && <Image {...photoProps(lead.image)} alt={lead.image.alt} fill sizes="400px" className="object-cover" />}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-linear-to-t from-inverse via-inverse/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">In harvest · {monthNames[month]}</p>
        {lead ? (
          <>
            <p className="mt-1 font-display text-3xl font-medium">{lead.name}</p>
            <p className="mt-1 text-sm text-inverse-foreground/80">{lead.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {products.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onOpen(p)}
                  className="rounded-control border border-inverse-foreground/25 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-inverse-foreground/15"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-1 font-display text-2xl font-medium">The orchards are resting.</p>
        )}
      </div>
    </div>
  );
}
