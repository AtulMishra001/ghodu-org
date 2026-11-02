"use client";

import { useState, type FormEvent } from "react";
import { CheckCircleIcon, PaperPlaneTiltIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import EnquiryTrap, { useFillTimer } from "@/components/shared/EnquiryTrap";
import { Field, QuantityPicker } from "@/components/shared/QuoteProvider";
import Thumb from "@/components/shared/Thumb";
import { formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";
import { enquiryHandoff, enquiryMessage, sendEnquiry, type EnquiryUnit } from "@/lib/enquiry";
import { haptic } from "@/lib/haptics";
import { button } from "@/lib/ui";

// A direct enquiry for this one product. For several products at once,
// the bulk enquiry sheet (QuoteProvider) stays available from the hero.
export default function ProductEnquiryForm({ product }: { product: Product }) {
  const fillTime = useFillTimer();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  /** Set once sent; cleared when they start typing another enquiry. */
  const [sent, setSent] = useState<{ handoff: ReturnType<typeof enquiryHandoff> } | null>(null);
  const [form, setForm] = useState(product.forms[0]);
  const [qty, setQty] = useState(100);
  const [unit, setUnit] = useState<EnquiryUnit>("kg");
  const moq = product.ordering?.moq;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const element = e.currentTarget;
    const data = new FormData(element);
    const text = (key: string) => String(data.get(key) ?? "");
    const line = { name: product.name, form, qty, unit };
    haptic(12);
    setSending(true);
    setError("");
    setSent(null);
    try {
      await sendEnquiry({
        form: "product",
        subject: `Enquiry about ${product.name}`,
        company: text("company"),
        name: text("name"),
        contact: text("contact"),
        city: text("city"),
        message: text("notes"),
        items: [line],
        source: `product:${product.slug}`,
        website: text("website"),
        fillMs: fillTime(),
      });
      setSent({ handoff: enquiryHandoff(enquiryMessage([line], data)) });
      element.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col gap-4 rounded-card border bg-surface p-4 md:p-5">
      <div className="flex items-center gap-3">
        <Thumb photo={product.image} className="size-12 shrink-0 rounded-tile" sizes="48px" />
        <div className="min-w-0">
          <h3 className="font-display text-[22px] leading-tight font-medium tracking-tight">Enquire about {product.name.toLowerCase()}</h3>
          <p className="text-sm text-muted-foreground">We&apos;ll confirm grade, packing and price.</p>
        </div>
      </div>

      {product.forms.length > 1 && (
        <div>
          <p className="text-sm font-semibold">Form</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.forms.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={form === f}
                onClick={() => setForm(f)}
                className={`rounded-control px-3 py-1.5 text-sm font-semibold transition-colors ${
                  form === f ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm font-semibold">
          Quantity
          {moq && <span className="font-normal text-muted-foreground">Minimum order {formatQuantity(moq)}</span>}
        </p>
        <div className="mt-1.5">
          <QuantityPicker
            qty={qty}
            unit={unit}
            label={product.name}
            onChange={(patch) => {
              if (patch.qty !== undefined) setQty(patch.qty);
              if (patch.unit) setUnit(patch.unit);
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field name="company" label="Company" autoComplete="organization" required />
        <Field name="name" label="Your name" autoComplete="name" required />
        <Field name="contact" label="Phone or email" autoComplete="email" required />
        <Field name="city" label="Deliver to (city, country)" autoComplete="address-level2" />
        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2 lg:col-span-1 xl:col-span-2">
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

      <button type="submit" disabled={sending} className={`${button("primary", "md")} mt-auto w-full disabled:opacity-70`}>
        {sending ? <SpinnerGapIcon size={20} className="animate-spin" /> : <PaperPlaneTiltIcon size={20} />}
        {sending ? "Submitting..." : "Send enquiry"}
      </button>
      <div aria-live="polite" className="empty:hidden">
        {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
        {sent && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-primary">
            <CheckCircleIcon size={18} weight="fill" className="shrink-0" />
            Thanks, we&apos;ve received your enquiry.
            {sent.handoff && (
              <a href={sent.handoff.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {sent.handoff.label}
              </a>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
