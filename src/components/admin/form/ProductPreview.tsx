"use client";

import Image from "next/image";
import MonthBar from "@/components/shared/MonthBar";
import type { ProductDraft } from "@/lib/product-input";

// Live preview of the catalogue card, styled like the public product tile.
export default function ProductPreview({ form }: { form: ProductDraft }) {
  return (
    <section className="rounded-card border bg-surface p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Preview</h2>
      <div className="mx-auto mt-3 max-w-56">
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-inverse text-inverse-foreground">
          {form.coverImage && <Image src={form.coverImage.url} alt="" fill sizes="224px" className="object-cover" />}
          <div className="absolute inset-0 bg-linear-to-t from-inverse/95 via-inverse/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-inverse-foreground/70">{form.kind || "Type"}</p>
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-display text-xl leading-tight font-medium">{form.name || "Product name"}</span>
              {form.localName && <span className="text-xs italic text-inverse-foreground/70">{form.localName}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 pt-2 text-xs">
          <span className="truncate font-semibold">{form.forms.join(" · ") || "Forms"}</span>
          <span className="shrink-0 text-muted-foreground">{form.category}</span>
        </div>
        <div className="mt-2">
          <MonthBar harvest={form.harvest} />
        </div>
      </div>
    </section>
  );
}
