"use client";

import Image from "next/image";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowCounterClockwiseIcon,
  BasketIcon,
  CalendarCheckIcon,
  ChatCircleIcon,
  CheckIcon,
  EyedropperSampleIcon,
  PaperPlaneTiltIcon,
  SpinnerGapIcon,
  TrashIcon,
  type Icon,
} from "@phosphor-icons/react";
import EnquiryTrap from "@/components/shared/EnquiryTrap";
import { Field, QuantityPicker } from "@/components/shared/QuoteProvider";
import Thumb from "@/components/shared/Thumb";
import type { ContactContent, ContactIntent } from "@/data/contact";
import { photoProps } from "@/lib/photo";
import { button, container } from "@/lib/ui";
import { useContactForm } from "./ContactProvider";
import MessagePreview from "./MessagePreview";
import { useContactSend } from "./useContactSend";

const ease = [0.22, 1, 0.36, 1] as const;

const intentIcons: Record<ContactIntent["id"], Icon> = {
  order: BasketIcon,
  sample: EyedropperSampleIcon,
  season: CalendarCheckIcon,
  other: ChatCircleIcon,
};

// Signature of this page: choose what you're after and the form reshapes itself,
// the photo changes with it, and a chat bubble shows the message as it's written.
export default function ContactDesk({ intro, intents }: Pick<ContactContent, "intro" | "intents">) {
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { products, intent, lines, status, setValues, chooseIntent, toggleProduct, updateLine, reset } = useContactForm();
  const { bySlug, message, handoff, sending, error, send } = useContactSend();

  function readForm() {
    if (!formRef.current) return;
    const next: Record<string, string> = {};
    new FormData(formRef.current).forEach((value, key) => {
      if (typeof value === "string") next[key] = value;
    });
    setValues(next);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The form is taller than what replaces it, so bring the result into view.
    if (await send(new FormData(e.currentTarget))) cardRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <section id="enquiry" className={`${container} pt-3 md:pt-6`}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-10">
        {/* ---------- Left: photo, title and (on large screens) the live message ---------- */}
        <div className="relative isolate flex h-56 flex-col overflow-hidden rounded-card bg-inverse p-5 text-inverse-foreground md:h-72 md:p-8 lg:sticky lg:top-[88px] lg:h-[calc(100svh-104px)] xl:p-10">
          {intents.map((i) => (
            <motion.div
              key={i.id}
              aria-hidden={i.id !== intent.id}
              initial={false}
              animate={{ opacity: i.id === intent.id ? 1 : 0, scale: i.id === intent.id ? 1 : 1.06 }}
              transition={{ duration: 0.9, ease }}
              className="absolute inset-0 -z-20"
            >
              <Image {...photoProps(i.image)} alt={i.image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" priority={i.id === intents[0].id} className="object-cover" />
            </motion.div>
          ))}
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-inverse/85 via-inverse/45 to-inverse/70" />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
          >
            <span className="h-px w-6 bg-accent/60" />
            {intro.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-2 max-w-2xl font-display text-[34px] leading-[1.06] font-medium tracking-tight text-balance md:text-[52px] xl:text-[64px] 2xl:text-[76px]"
          >
            {intro.titleStart} <span className="italic text-accent">{intro.titleAccent}</span> {intro.titleEnd}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="mt-3 max-w-lg text-sm leading-relaxed text-inverse-foreground/90 md:text-lg"
          >
            {intro.summary}
          </motion.p>

          <div className="mt-auto hidden max-w-xl pt-4 lg:block">
            <MessagePreview message={message} />
          </div>
        </div>

        {/* ---------- Right: the form ---------- */}
        <div ref={cardRef} className="min-w-0 rounded-card border bg-surface p-4 md:p-6 xl:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {status !== "idle" ? (
              <motion.div
                key="done"
                role="status"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease }}
                className="flex flex-col items-start"
              >
                <motion.span
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.1 }}
                  className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <CheckIcon size={28} weight="bold" />
                </motion.span>
                <h2 className="mt-4 font-display text-[30px] leading-tight font-medium tracking-tight md:text-[40px]">
                  We&apos;ve received your enquiry
                </h2>
                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-base">
                  Our team will get back to you using the details you gave us.
                </p>
                <MessagePreview message={message} className="mt-5 w-full max-w-xl text-muted-foreground lg:hidden" />
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button type="button" onClick={reset} className={button("outline", "md")}>
                    <ArrowCounterClockwiseIcon size={18} />
                    Start a new message
                  </button>
                  {handoff && (
                    <a href={handoff.href} target="_blank" rel="noopener noreferrer" className={button("quiet", "md")}>
                      {handoff.label}
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={submit}
                onChange={readForm}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 md:gap-6"
              >
                <fieldset>
                  <legend className="text-sm font-semibold">What can we help with?</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-4">
                    {intents.map((i) => {
                      const IntentIcon = intentIcons[i.id];
                      const active = i.id === intent.id;
                      return (
                        <button
                          key={i.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => chooseIntent(i.id)}
                          className={`relative flex min-h-24 flex-col items-start gap-1.5 overflow-hidden rounded-tile border p-3 text-left transition-[border-color,transform] duration-200 active:scale-[0.98] ${
                            active ? "border-transparent text-primary-foreground" : "hover:border-foreground/40"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="contact-intent"
                              className="absolute inset-0 bg-primary"
                              transition={{ type: "spring", stiffness: 480, damping: 40 }}
                            />
                          )}
                          <IntentIcon size={22} weight="duotone" className={`relative ${active ? "" : "text-primary"}`} />
                          <span className="relative leading-tight">
                            <span className="block text-sm font-semibold">{i.label}</span>
                            <span className={`mt-0.5 block text-xs ${active ? "text-primary-foreground/85" : "text-muted-foreground"}`}>{i.blurb}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <AnimatePresence initial={false}>
                  {intent.withProducts && (
                    <motion.div
                      key="products"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="overflow-hidden"
                    >
                      <fieldset>
                        <legend className="text-sm font-semibold">Which products?</legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {products.map((p) => {
                            const picked = lines.some((l) => l.slug === p.slug);
                            return (
                              <button
                                key={p.slug}
                                type="button"
                                aria-pressed={picked}
                                onClick={() => toggleProduct(p.slug)}
                                className={`flex h-11 items-center gap-2 rounded-control border pr-3 pl-1.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-95 ${
                                  picked ? "border-primary bg-surface-muted" : "hover:border-foreground/40"
                                }`}
                              >
                                <span className="relative size-8 shrink-0">
                                  <Thumb photo={p.image} className="size-8 rounded-lg" sizes="32px" />
                                  <AnimatePresence>
                                    {picked && (
                                      <motion.span
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.6 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute inset-0 grid place-items-center rounded-lg bg-primary text-primary-foreground"
                                      >
                                        <CheckIcon size={16} weight="bold" />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                                {p.name}
                              </button>
                            );
                          })}
                        </div>

                        <ul className="mt-2 flex flex-col gap-2 empty:mt-0">
                          <AnimatePresence initial={false} mode="popLayout">
                            {lines.map((line) => {
                              const product = bySlug.get(line.slug);
                              if (!product) return null;
                              return (
                                <motion.li
                                  key={line.slug}
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ duration: 0.3, ease }}
                                  className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-tile bg-surface-muted/60 p-2.5"
                                >
                                  <div className="min-w-0 flex-1 basis-40">
                                    <p className="truncate text-sm font-semibold">{product.name}</p>
                                    {product.forms.length > 1 ? (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {product.forms.map((form) => (
                                          <button
                                            key={form}
                                            type="button"
                                            aria-pressed={line.form === form}
                                            onClick={() => updateLine(line.slug, { form })}
                                            className={`rounded-md px-2 py-0.5 text-xs font-semibold transition-colors ${
                                              line.form === form ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
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
                                  {intent.withQuantity && (
                                    <div className="max-sm:order-last max-sm:w-full sm:w-64">
                                      <QuantityPicker
                                        qty={line.qty}
                                        unit={line.unit}
                                        label={product.name}
                                        onChange={(patch) => updateLine(line.slug, patch)}
                                      />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    aria-label={`Remove ${product.name}`}
                                    onClick={() => toggleProduct(line.slug)}
                                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-background active:scale-90"
                                  >
                                    <TrashIcon size={18} />
                                  </button>
                                </motion.li>
                              );
                            })}
                          </AnimatePresence>
                        </ul>
                      </fieldset>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field name="company" label="Company" autoComplete="organization" required />
                  <Field name="name" label="Your name" autoComplete="name" required />
                  <Field name="contact" label="Phone or email" autoComplete="email" required />
                  <div className={intent.withDelivery ? "" : "hidden"}>
                    <Field name="city" label="Deliver to (city, country)" autoComplete="address-level2" />
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                    {intent.notesLabel}
                    <textarea
                      name="notes"
                      rows={3}
                      required={!intent.withProducts}
                      placeholder={intent.notesHint}
                      className="resize-none rounded-control border bg-surface px-3.5 py-2.5 text-[15px] font-normal outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
                    />
                  </label>
                </div>

                <EnquiryTrap />

                <MessagePreview message={message} className="text-muted-foreground lg:hidden" />

                {error && (
                  <p role="alert" className="text-sm font-semibold text-red-700">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={sending} className={`${button("primary", "lg")} w-full disabled:opacity-70`}>
                  {sending ? <SpinnerGapIcon size={20} className="animate-spin" /> : <PaperPlaneTiltIcon size={20} />}
                  {sending ? "Submitting..." : "Send enquiry"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
