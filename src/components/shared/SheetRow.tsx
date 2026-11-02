"use client";

import { useState, type ReactNode } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { haptic } from "@/lib/haptics";
import { Sheet } from "./Sheet";

// A tappable row that opens its content in a bottom sheet, so long secondary
// content takes one line of a phone screen until someone asks for it.
export default function SheetRow({ icon, title, hint, children }: { icon?: ReactNode; title: string; hint?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptic(5);
          setOpen(true);
        }}
        className="flex w-full items-center gap-3 py-3 text-left transition active:opacity-60"
      >
        {icon && <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-surface-muted text-primary">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight">{title}</span>
          {hint && <span className="mt-0.5 block truncate text-sm text-muted-foreground">{hint}</span>}
        </span>
        <CaretRightIcon size={16} className="shrink-0 text-muted-foreground" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Sheet>
    </>
  );
}
