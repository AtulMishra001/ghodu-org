"use client";

import { useState } from "react";
import { useFillTimer } from "@/components/shared/EnquiryTrap";
import { enquiryHandoff, enquiryMessage, sendEnquiry, type EnquiryLine } from "@/lib/enquiry";
import { haptic } from "@/lib/haptics";
import { useContactForm } from "./ContactProvider";

// The enquiry being written and how it's sent, for both the desktop form and the phone flow.
export function useContactSend() {
  const { products, intent, lines, values, setStatus } = useContactForm();
  const fillTime = useFillTimer();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items: EnquiryLine[] = intent.withProducts
    ? lines.map((l) => ({
        name: bySlug.get(l.slug)?.name ?? l.slug,
        form: l.form,
        ...(intent.withQuantity ? { qty: l.qty, unit: l.unit } : {}),
      }))
    : [];

  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value && (key !== "city" || intent.withDelivery)) data.set(key, value);
  }
  const message = enquiryMessage(items, data, intent.subject);

  /** Resolves true once the enquiry is saved. */
  async function send(form: FormData) {
    if (sending) return false;
    const text = (key: string) => String(form.get(key) ?? "");
    haptic(12);
    setSending(true);
    setError("");
    try {
      await sendEnquiry({
        form: "contact",
        subject: intent.subject,
        company: text("company"),
        name: text("name"),
        contact: text("contact"),
        city: intent.withDelivery ? text("city") : "",
        message: text("notes"),
        items,
        source: `contact:${intent.id}`,
        website: text("website"),
        fillMs: fillTime(),
      });
      setStatus("sent");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your enquiry. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }

  return { bySlug, message, handoff: enquiryHandoff(message), sending, error, send };
}
