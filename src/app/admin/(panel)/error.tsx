"use client";

import { ArrowClockwiseIcon, PlugsIcon } from "@phosphor-icons/react";
import { button } from "@/lib/ui";

// Shown when the database or Cloudinary can't be reached while rendering.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border bg-surface px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-surface-muted text-primary">
        <PlugsIcon size={28} weight="duotone" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-medium">Couldn&apos;t load the catalogue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The database didn&apos;t respond. Check your connection and the MONGODB_URI setting, then try again.
      </p>
      <button type="button" onClick={reset} className={`${button("primary", "md")} mt-5`}>
        <ArrowClockwiseIcon size={18} />
        Try again
      </button>
    </div>
  );
}
