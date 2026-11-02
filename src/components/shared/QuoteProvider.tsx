"use client";

import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircleIcon, MinusIcon, PaperPlaneTiltIcon, PlusIcon, SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";
import type { Product } from "@/data/products";
import { enquiryHandoff, enquiryMessage, sendEnquiry, type EnquiryUnit } from "@/lib/enquiry";
import { haptic } from "@/lib/haptics";
import { button } from "@/lib/ui";
import EnquiryTrap, { useFillTimer } from "./EnquiryTrap";
import Thumb from "./Thumb";
import { Sheet } from "./Sheet";
import { useToast } from "./Toast";

type Line = { slug: string; qty: number; unit: EnquiryUnit; form: string };

type QuoteContextValue = {
  count: number;
  has: (slug: string) => boolean;
  /** Adds the product (if given) and opens the enquiry sheet. */
  open: (slug?: string) => void;
  /** Adds the product without opening the sheet. */
  add: (slug: string) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}

const step: Record<EnquiryUnit, number> = { kg: 25, t: 1 };

export default function QuoteProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  /** Set once sent: the sheet shows a confirmation until it's closed. */
  const [sent, setSent] = useState<{ handoff: ReturnType<typeof enquiryHandoff> } | null>(null);
  const fillTime = useFillTimer();
  const toast = useToast();
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const addLine = useCallback(
    (slug: string) => {
      const product = bySlug.get(slug);
      if (!product) return;
      setLines((prev) =>
        prev.some((l) => l.slug === slug) ? prev : [...prev, { slug, qty: 100, unit: "kg", form: product.forms[0] }],
      );
    },
    [bySlug],
  );

  const value = useMemo<QuoteContextValue>(
    () => ({
      count: lines.length,
      has: (slug) => lines.some((l) => l.slug === slug),
      open: (slug) => {
        haptic(8);
        if (slug) addLine(slug);
        setIsOpen(true);
      },
      add: (slug) => {
        haptic(8);
        addLine(slug);
        toast(`${bySlug.get(slug)?.name ?? "Item"} added to your enquiry`);
      },
    }),
    [lines, addLine, toast, bySlug],
  );

  const update = (slug: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, ...patch } : l)));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "");
    const items = lines.map((l) => ({ name: bySlug.get(l.slug)?.name ?? l.slug, form: l.form, qty: l.qty, unit: l.unit }));

    haptic(12);
    setSending(true);
    setError("");
    try {
      await sendEnquiry({
        form: "bulk",
        subject: "Bulk enquiry",
        company: text("company"),
        name: text("name"),
        contact: text("contact"),
        city: text("city"),
        message: text("notes"),
        items,
        source: `bulk:${window.location.pathname}`,
        website: text("website"),
        fillMs: fillTime(),
      });
      setSent({ handoff: enquiryHandoff(enquiryMessage(items, data)) });
      setLines([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function closeSheet() {
    setIsOpen(false);
    setSent(null);
    setError("");
  }

  const notAdded = products.filter((p) => !lines.some((l) => l.slug === p.slug));

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <Sheet
        open={isOpen}
        onClose={closeSheet}
        title={sent ? "Enquiry received" : "Bulk enquiry"}
        description={sent ? undefined : "Pick products and rough quantities — we'll confirm grade, packing and price."}
      >
        {sent ? (
          <div role="status" className="flex flex-col gap-4 pb-2">
            <p className="flex items-start gap-2 text-[15px] leading-relaxed">
              <CheckCircleIcon size={22} weight="fill" className="shrink-0 text-primary" />
              Thanks, we&apos;ve received your enquiry. Our team will get back to you using the details you gave us.
            </p>
            <div className="grid gap-2">
              {sent.handoff && (
                <a href={sent.handoff.href} target="_blank" rel="noopener noreferrer" className={button("quiet", "lg")}>
                  {sent.handoff.label}
                </a>
              )}
              <button type="button" onClick={closeSheet} className={button("primary", "lg")}>
                Done
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={submit} className="flex flex-col gap-5 pb-2">
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {lines.length === 0 && (
                <motion.li
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-card border border-dashed px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Nothing added yet. Choose a product below to start.
                </motion.li>
              )}
              {lines.map((line) => {
                const product = bySlug.get(line.slug)!;
                return (
                  <motion.li
                    key={line.slug}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-card border bg-surface p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Thumb photo={product.image} className="size-12 rounded-tile" sizes="48px" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{product.name}</p>
                        {product.forms.length > 1 ? (
                          <div className="mt-1 flex gap-1">
                            {product.forms.map((form) => (
                              <button
                                key={form}
                                type="button"
                                aria-pressed={line.form === form}
                                onClick={() => update(line.slug, { form })}
                                className={`rounded-md px-2 py-0.5 text-xs font-semibold transition-colors ${
                                  line.form === form ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"
                                }`}
                              >
                                {form}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">{line.form}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        onClick={() => {
                          haptic(6);
                          setLines((prev) => prev.filter((l) => l.slug !== line.slug));
                        }}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition active:scale-90 hover:bg-surface-muted"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                    <div className="mt-3">
                      <QuantityPicker qty={line.qty} unit={line.unit} label={product.name} onChange={(patch) => update(line.slug, patch)} />
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {notAdded.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Add products</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {notAdded.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      haptic(5);
                      addLine(p.slug);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-control border bg-surface px-3 text-sm font-semibold transition active:scale-95 hover:border-primary"
                  >
                    <PlusIcon size={14} weight="bold" className="text-primary" />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="company" label="Company" autoComplete="organization" required />
            <Field name="name" label="Your name" autoComplete="name" required />
            <Field name="contact" label="Phone or email" autoComplete="email" required className="sm:col-span-2" />
            <Field name="city" label="Deliver to (city, country)" autoComplete="address-level2" className="sm:col-span-2" />
            <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
              Notes
              <textarea
                name="notes"
                rows={2}
                placeholder="Grade, packing, timeline…"
                className="resize-none rounded-control border bg-surface px-3.5 py-2.5 text-[15px] font-normal outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </label>
          </div>

          <EnquiryTrap />

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={lines.length === 0 || sending} className={`${button("primary", "lg")} w-full disabled:opacity-40`}>
            {sending ? <SpinnerGapIcon size={20} className="animate-spin" /> : <PaperPlaneTiltIcon size={20} />}
            {sending ? "Submitting..." : "Send enquiry"}
          </button>
        </form>
        )}
      </Sheet>
    </QuoteContext.Provider>
  );
}

export function Field({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold ${className ?? ""}`}>
      {label}
      <input
        {...props}
        className="h-12 rounded-control border bg-surface px-3.5 text-[15px] font-normal outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

// Quantity stepper and kg/tonnes switch. Changing the unit resets to a sensible amount.
export function QuantityPicker({
  qty,
  unit,
  label,
  onChange,
}: {
  qty: number;
  unit: EnquiryUnit;
  label: string;
  onChange: (patch: { qty?: number; unit?: EnquiryUnit }) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Stepper value={qty} step={step[unit]} label={label} onChange={(value) => onChange({ qty: value })} />
      <div className="grid grid-cols-2 rounded-control bg-surface-muted p-0.5 text-xs font-semibold">
        {(["kg", "t"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={unit === option}
            onClick={() => onChange({ unit: option, qty: option === "t" ? 1 : 100 })}
            className={`h-8 rounded-[10px] px-3 transition-colors ${
              unit === option ? "bg-background text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            {option === "kg" ? "kg" : "tonnes"}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stepper({
  value,
  step,
  label,
  onChange,
}: {
  value: number;
  step: number;
  label: string;
  onChange: (v: number) => void;
}) {
  const change = (delta: number) => {
    haptic(4);
    onChange(Math.max(step, value + delta));
  };
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Less ${label}`}
        onClick={() => change(-step)}
        className="grid size-9 place-items-center rounded-control bg-surface-muted transition active:scale-90"
      >
        <MinusIcon size={16} weight="bold" />
      </button>
      <span className="relative grid h-9 w-14 place-items-center overflow-hidden font-semibold tabular" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        onClick={() => change(step)}
        className="grid size-9 place-items-center rounded-control bg-surface-muted transition active:scale-90"
      >
        <PlusIcon size={16} weight="bold" />
      </button>
    </div>
  );
}
