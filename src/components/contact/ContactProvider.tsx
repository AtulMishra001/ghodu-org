"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ContactContent, ContactIntent } from "@/data/contact";
import type { Product } from "@/data/products";
import type { EnquiryUnit } from "@/lib/enquiry";
import { haptic } from "@/lib/haptics";

export type ContactLine = { slug: string; qty: number; unit: EnquiryUnit; form: string };
export type ContactStatus = "idle" | "sent";

type ContactValue = {
  products: Product[];
  intent: ContactIntent;
  lines: ContactLine[];
  values: Record<string, string>;
  status: ContactStatus;
  setValues: (values: Record<string, string>) => void;
  setStatus: (status: ContactStatus) => void;
  chooseIntent: (id: ContactIntent["id"]) => void;
  hasProduct: (slug: string) => boolean;
  toggleProduct: (slug: string) => void;
  updateLine: (slug: string, patch: Partial<ContactLine>) => void;
  reset: () => void;
  goToForm: () => void;
};

/** Fired when something asks to go to the form, which on phones means moving the flow on. */
export const TO_FORM_EVENT = "contact:to-form";

const ContactContext = createContext<ContactValue | null>(null);

export function useContactForm() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContactForm must be used inside <ContactProvider>");
  return ctx;
}

// The enquiry form's state, shared so sections further down the page can fill it in.
export default function ContactProvider({
  intents,
  products,
  children,
}: Pick<ContactContent, "intents" | "products"> & { children: ReactNode }) {
  const [intentId, setIntentId] = useState<ContactIntent["id"]>(intents[0].id);
  const [lines, setLines] = useState<ContactLine[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ContactStatus>("idle");

  const intent = intents.find((i) => i.id === intentId) ?? intents[0];

  const value = useMemo<ContactValue>(() => {
    // Picking something new after a send starts a fresh message: the old one is done with.
    function clearIfSent() {
      if (status === "idle") return;
      setStatus("idle");
      setLines([]);
      setValues({});
    }

    return {
      products,
      intent,
      lines,
      values,
      status,
      setValues,
      setStatus,
      chooseIntent: (id) => {
        haptic(5);
        clearIfSent();
        setIntentId(id);
      },
      hasProduct: (slug) => status === "idle" && lines.some((l) => l.slug === slug),
      toggleProduct: (slug) => {
        const product = products.find((p) => p.slug === slug);
        if (!product) return;
        haptic(5);
        clearIfSent();
        // A product only makes sense on an enquiry type that lists products.
        if (!intent.withProducts) setIntentId(intents[0].id);
        setLines((prev) => {
          const current = status === "idle" ? prev : [];
          return current.some((l) => l.slug === slug)
            ? current.filter((l) => l.slug !== slug)
            : [...current, { slug, qty: 100, unit: "kg", form: product.forms[0] }];
        });
      },
      updateLine: (slug, patch) => setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, ...patch } : l))),
      reset: () => {
        setStatus("idle");
        setLines([]);
        setValues({});
      },
      goToForm: () => {
        window.dispatchEvent(new Event(TO_FORM_EVENT));
        document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    };
  }, [products, intents, intent, lines, values, status]);

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}
