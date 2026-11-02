"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CalendarBlankIcon,
  CaretLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ListNumbersIcon,
  PaperPlaneTiltIcon,
  QuestionIcon,
  SpinnerGapIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import EnquiryTrap from "@/components/shared/EnquiryTrap";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { Field, QuantityPicker } from "@/components/shared/QuoteProvider";
import { Sheet } from "@/components/shared/Sheet";
import Thumb from "@/components/shared/Thumb";
import type { ContactContent } from "@/data/contact";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";
import { seasonLabel } from "@/lib/season";
import { button } from "@/lib/ui";
import BuyerGuide from "./BuyerGuide";
import { TO_FORM_EVENT, useContactForm } from "./ContactProvider";
import MessagePreview from "./MessagePreview";
import SeasonWatch from "./SeasonWatch";
import { useContactSend } from "./useContactSend";

type StepId = "need" | "products" | "you" | "finish";
type Help = "next" | "season" | "buyers" | "faqs" | null;

const heading = "font-display text-[27px] leading-[1.1] font-medium tracking-tight text-balance";

const helpTitles: Record<NonNullable<Help>, string> = {
  next: "What happens next",
  season: "What's in season",
  buyers: "Who we work with",
  faqs: "Before you write",
};

// The phone's Contact page: one question per screen, with the answer to each
// shaping the next. There's no page scroll; it fills the space between the bars.
export default function ContactFlow({ intro, intents, channels, season, buyers, steps, faqs }: Pick<ContactContent, "intro" | "intents" | "channels" | "season" | "buyers" | "steps" | "faqs">) {
  const { products, intent, lines, status, setValues, chooseIntent, toggleProduct, updateLine, reset } = useContactForm();
  const { bySlug, message, handoff, sending, error, send } = useContactSend();
  const form = useRef<HTMLFormElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [help, setHelp] = useState<Help>(null);

  const flow: StepId[] = ["need", ...(intent.withProducts ? (["products"] as const) : []), "you", "finish"];
  const index = Math.min(stepIndex, flow.length - 1);
  const step = flow[index];
  const isLast = index === flow.length - 1;

  // "Plan season supply" and the like, from the help sheets: back to the form, past the first question.
  useEffect(() => {
    const onToForm = () => {
      setHelp(null);
      setDir(1);
      setStepIndex(1);
    };
    window.addEventListener(TO_FORM_EVENT, onToForm);
    return () => window.removeEventListener(TO_FORM_EVENT, onToForm);
  }, []);

  function move(next: number) {
    haptic(5);
    setDir(next > index ? 1 : -1);
    setStepIndex(next);
  }

  function readForm() {
    if (!form.current) return;
    const next: Record<string, string> = {};
    new FormData(form.current).forEach((value, key) => {
      if (typeof value === "string") next[key] = value;
    });
    setValues(next);
  }

  /** Native validation, one step at a time: the first problem in this step gets the message. */
  function stepIsValid(id: StepId) {
    const fields = form.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[data-step="${id}"] input, [data-step="${id}"] textarea`);
    return [...(fields ?? [])].every((field) => field.reportValidity());
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid(step)) return;
    if (isLast) await send(new FormData(e.currentTarget));
    else move(index + 1);
  }

  function startAgain() {
    reset();
    setDir(1);
    setStepIndex(0);
  }

  const none = intent.withProducts && step === "products" && lines.length === 0;

  return (
    <section data-fullscreen aria-label="Send an enquiry" className="flex h-app-screen flex-col md:hidden">
      {status !== "idle" ? (
        <div role="status" className="flex flex-1 flex-col justify-center px-4">
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <CheckIcon size={32} weight="bold" />
          </motion.span>
          <h1 className={`mt-4 ${heading}`}>We&apos;ve received your enquiry</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Our team will get back to you using the details you gave us.</p>
          <MessagePreview message={message} className="mt-4 text-muted-foreground" />
          <div className="mt-5 grid gap-2">
            {handoff && (
              <a href={handoff.href} target="_blank" rel="noopener noreferrer" className={button("quiet", "lg")}>
                {handoff.label}
              </a>
            )}
            <button type="button" onClick={startAgain} className={button("outline", "lg")}>
              <ArrowCounterClockwiseIcon size={18} />
              Start a new message
            </button>
          </div>
        </div>
      ) : (
        <form ref={form} noValidate onSubmit={submit} onChange={readForm} className="flex min-h-0 flex-1 flex-col">
          {/* ---------- progress ---------- */}
          <div className="flex h-9 shrink-0 items-center gap-2 px-2">
            <button
              type="button"
              onClick={() => move(index - 1)}
              disabled={index === 0}
              aria-label="Previous question"
              className="grid size-9 shrink-0 place-items-center rounded-full transition active:scale-90 disabled:invisible"
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>
            <div role="progressbar" aria-label="Enquiry progress" aria-valuemin={1} aria-valuemax={flow.length} aria-valuenow={index + 1} className="flex flex-1 gap-1">
              {flow.map((id, i) => (
                <span key={id} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= index ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
            <span className="w-9 text-center text-xs font-semibold text-muted-foreground tabular">
              {index + 1}/{flow.length}
            </span>
          </div>

          {/* Steps stay mounted while hidden, so what's been typed is kept and sent. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3" style={{ "--step-dir": dir } as CSSProperties}>
            <div data-step="need" className={step === "need" ? "flex min-h-full animate-step-in flex-col" : "hidden"}>
              <h1 className={heading}>
                {intro.titleStart} <span className="italic text-primary">{intro.titleAccent}</span> {intro.titleEnd}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Pick one to start.</p>
              <div className="mt-3 grid flex-1 auto-rows-fr grid-cols-2 gap-2.5">
                {intents.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    aria-pressed={i.id === intent.id}
                    onClick={() => {
                      chooseIntent(i.id);
                      setDir(1);
                      setStepIndex(1);
                    }}
                    className="relative isolate flex min-h-28 flex-col justify-end overflow-hidden rounded-card bg-inverse p-3 text-left text-inverse-foreground transition active:scale-[0.97]"
                  >
                    <Image {...photoProps(i.image)} alt="" fill sizes="50vw" className="-z-20 object-cover" />
                    <span className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/60 to-inverse/10" />
                    <span className="font-display text-xl leading-tight font-medium">{i.label}</span>
                    <span className="mt-0.5 text-xs leading-snug text-inverse-foreground/85">{i.blurb}</span>
                  </button>
                ))}
              </div>
              {channels.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {channels.map((c) => (
                    <li key={c.kind}>
                      {c.href ? (
                        <a href={c.href} target={c.kind === "whatsapp" ? "_blank" : undefined} rel={c.kind === "whatsapp" ? "noreferrer" : undefined} className="font-semibold text-primary">
                          {c.label}: {c.value}
                        </a>
                      ) : (
                        <span>
                          {c.label}: {c.value}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <ul aria-label="Help" className="rail -mx-4 mt-2.5 shrink-0 scroll-pl-4 gap-1.5 px-4">
                {(
                  [
                    ["next", ListNumbersIcon],
                    ["season", CalendarBlankIcon],
                    ["buyers", UsersThreeIcon],
                    ["faqs", QuestionIcon],
                  ] as const
                ).map(([id, HelpIcon]) => (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        haptic(5);
                        setHelp(id);
                      }}
                      className="flex h-9 items-center gap-1.5 rounded-control border bg-surface px-2.5 text-sm font-semibold whitespace-nowrap transition active:scale-95"
                    >
                      <HelpIcon size={16} className="text-primary" />
                      {helpTitles[id]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <fieldset data-step="products" className={step === "products" ? "animate-step-in" : "hidden"}>
              <legend className={heading}>Which products?</legend>
              <p className="mt-1 text-sm text-muted-foreground">Rough quantities are fine. We&apos;ll confirm grade, packing and price.</p>
              <ul className="mt-2 divide-y border-y">
                {products.map((p) => {
                  const line = lines.find((l) => l.slug === p.slug);
                  return (
                    <li key={p.slug}>
                      <button type="button" aria-pressed={!!line} onClick={() => toggleProduct(p.slug)} className="flex w-full items-center gap-3 py-2 text-left">
                        <Thumb photo={p.image} className="size-11 shrink-0 rounded-tile" sizes="44px" />
                        <span className="min-w-0 flex-1">
                          <span className="block leading-tight font-semibold">{p.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">Harvest {seasonLabel(p.harvest)}</span>
                        </span>
                        <span className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${line ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                          {line && <CheckIcon size={14} weight="bold" />}
                        </span>
                      </button>
                      {line && (
                        <div className="flex flex-col gap-2 pb-2.5">
                          {p.forms.length > 1 && (
                            <div className="flex flex-wrap gap-1">
                              {p.forms.map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  aria-pressed={line.form === f}
                                  onClick={() => updateLine(p.slug, { form: f })}
                                  className={`h-8 rounded-md px-2.5 text-xs font-semibold transition-colors ${line.form === f ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"}`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          )}
                          {intent.withQuantity && <QuantityPicker qty={line.qty} unit={line.unit} label={p.name} onChange={(patch) => updateLine(p.slug, patch)} />}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            <div data-step="you" className={step === "you" ? "flex animate-step-in flex-col gap-3" : "hidden"}>
              <h2 className={heading}>Who should we reply to?</h2>
              <Field name="company" label="Company" autoComplete="organization" required enterKeyHint="next" />
              <Field name="name" label="Your name" autoComplete="name" required enterKeyHint="next" />
              <Field name="contact" label="Phone or email" autoComplete="email" required enterKeyHint="next" />
            </div>

            <div data-step="finish" className={step === "finish" ? "flex animate-step-in flex-col gap-3" : "hidden"}>
              <h2 className={heading}>Anything to add?</h2>
              {intent.withDelivery && <Field name="city" label="Deliver to (city, country)" autoComplete="address-level2" />}
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                {intent.notesLabel}
                <textarea
                  name="notes"
                  rows={3}
                  required={!intent.withProducts}
                  placeholder={intent.notesHint}
                  className="resize-none rounded-control border bg-surface px-3.5 py-2.5 text-[15px] font-normal outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
              </label>
              <EnquiryTrap />
              <MessagePreview message={message} className="text-muted-foreground" />
              {error && (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
            </div>

            {/* A summary of what's chosen so far, so going back is rarely needed. */}
            {step === "you" && lines.length > 0 && intent.withProducts && (
              <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-primary" />
                {lines.map((l) => bySlug.get(l.slug)?.name).join(", ")}
              </p>
            )}
          </div>

          {/* The first step moves on by tapping a card, so it has no button. */}
          {step !== "need" && (
            <div className="shrink-0 border-t bg-background px-4 py-2.5">
              <button type="submit" disabled={sending} className={`${button(none ? "outline" : "primary", "lg")} w-full disabled:opacity-70`}>
                {isLast ? sending ? <SpinnerGapIcon size={20} className="animate-spin" /> : <PaperPlaneTiltIcon size={20} /> : <ArrowRightIcon size={20} />}
                {isLast ? (sending ? "Submitting..." : "Send enquiry") : none ? "Skip for now" : "Continue"}
              </button>
            </div>
          )}
        </form>
      )}

      <Sheet open={help !== null} onClose={() => setHelp(null)} title={help ? helpTitles[help] : ""}>
        {help === "next" && (
          <ol className="flex flex-col gap-4 pb-2">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground tabular">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="mt-0.5 block text-[15px] text-muted-foreground">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        {/* These two are full page sections on desktop; the sheet supplies the title and padding here. */}
        {help === "season" && (
          <div className="[&>section]:p-0 [&_section>div:first-child]:max-md:hidden">
            <SeasonWatch season={season} />
          </div>
        )}
        {help === "buyers" && (
          <div className="[&>section]:p-0 [&_section>div:first-child]:max-md:hidden">
            <BuyerGuide buyers={buyers} />
          </div>
        )}
        {help === "faqs" && <FaqAccordion faqs={faqs} />}
      </Sheet>
    </section>
  );
}
