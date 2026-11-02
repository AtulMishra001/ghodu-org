"use client";

import type { ClipboardEvent } from "react";
import { ClipboardTextIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Faq } from "@/lib/faq";
import { faqPasteStyles, parseFaqTable, parseFaqText } from "@/lib/faq-parser";
import { button } from "@/lib/ui";
import { field } from "../styles";

export const emptyFaq = (): Faq => ({ question: "", answer: "" });

// Repeatable question/answer rows. Pasting a multi-line FAQ list or a copied
// table into a question box splits it into rows; a one-line paste is left alone.
export default function FaqRows({ rows, onChange }: { rows: Faq[]; onChange: (rows: Faq[]) => void }) {
  const update = (index: number, patch: Partial<Faq>) => onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyFaq()]);
  };

  const paste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text/plain");
    if (!text.includes("\t") && !text.trim().includes("\n")) return;
    const parsed = text.includes("\t") ? parseFaqTable(text) : parseFaqText(text);
    if (!parsed.length) return;
    event.preventDefault();
    onChange([...rows.slice(0, index), ...parsed, ...rows.slice(index + 1)]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-control bg-surface-muted/60 p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <ClipboardTextIcon size={16} />
          Paste a whole FAQ list into the first question box and it splits into rows.
        </p>
        <ul className="mt-2 grid gap-1">
          {faqPasteStyles.map((style) => (
            <li key={style.label}>
              <span className="font-semibold text-foreground">{style.label}</span>: {style.hint}
            </li>
          ))}
        </ul>
        <p className="mt-2">Bold, heading and bullet marks are removed for you. Check the rows after pasting and fix anything in the wrong box.</p>
      </div>

      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li key={index} className="flex flex-col gap-2 rounded-control border p-3">
            <div className="flex items-start gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Question {index + 1}</span>
                <input value={row.question} onChange={(e) => update(index, { question: e.target.value })} onPaste={paste(index)} placeholder={`Question ${index + 1}`} className={`${field} w-full`} />
              </label>
              <button type="button" onClick={() => remove(index)} aria-label={`Remove FAQ ${index + 1}`} className="grid size-12 shrink-0 place-items-center rounded-control border text-muted-foreground transition hover:border-red-300 hover:text-red-700">
                <TrashIcon size={18} />
              </button>
            </div>
            <label>
              <span className="sr-only">Answer {index + 1}</span>
              <textarea value={row.answer} onChange={(e) => update(index, { answer: e.target.value })} rows={3} placeholder="Answer" className={`${field} h-auto w-full py-2.5`} />
            </label>
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => onChange([...rows, emptyFaq()])} className={`${button("outline", "sm")} self-start`}>
        <PlusIcon size={16} weight="bold" />
        Add row
      </button>
    </div>
  );
}
