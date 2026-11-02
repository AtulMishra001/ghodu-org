"use client";

import { useState, type FormEvent } from "react";
import { CheckCircleIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import EnquiryTrap, { useFillTimer } from "@/components/shared/EnquiryTrap";
import { sendEnquiry } from "@/lib/enquiry";
import { haptic } from "@/lib/haptics";
import { button } from "@/lib/ui";

const input = "w-full rounded-control border bg-surface px-3.5 py-2.5 text-[15px] font-normal outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

export default function PostEnquiryForm({ slug }: { slug: string }) {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({ kind: "idle" });
  const fillTime = useFillTimer();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });
    haptic(12);
    try {
      await sendEnquiry({
        form: "blog",
        subject: "Blog article enquiry",
        name: String(data.get("name") ?? ""),
        contact: String(data.get("phone") ?? ""),
        message: String(data.get("message") ?? ""),
        source: `blog:${slug}`,
        website: String(data.get("website") ?? ""),
        fillMs: fillTime(),
      });
      form.reset();
      setState({ kind: "sent" });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "We couldn't send your enquiry. Please try again." });
    }
  }

  const sending = state.kind === "sending";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border bg-surface p-4 md:p-5">
      <div>
        <h2 className="font-display text-2xl leading-tight font-medium tracking-tight">Ask about supply</h2>
        <p className="mt-1 text-sm text-muted-foreground">Leave your number and we&apos;ll get back to you.</p>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Name
        <input name="name" required autoComplete="name" maxLength={120} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Phone
        <input name="phone" type="tel" required autoComplete="tel" maxLength={30} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Message <span className="sr-only">(optional)</span>
        <textarea name="message" rows={3} maxLength={2000} placeholder="Optional: product, grade, quantity" className={`${input} resize-none`} />
      </label>
      <EnquiryTrap />
      <button type="submit" disabled={sending} className={`${button("primary", "md")} w-full disabled:opacity-70`}>
        {sending && <SpinnerGapIcon size={18} className="animate-spin" />}
        {sending ? "Submitting..." : "Send enquiry"}
      </button>
      <div aria-live="polite">
        {state.kind === "sent" && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircleIcon size={18} weight="fill" className="shrink-0" />
            Thanks, we&apos;ve received your enquiry.
          </p>
        )}
        {state.kind === "error" && <p className="text-sm font-semibold text-red-700">{state.message}</p>}
      </div>
    </form>
  );
}
