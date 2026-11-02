"use client";

import { useState } from "react";
import { SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";
import { Sheet } from "@/components/shared/Sheet";
import { button } from "@/lib/ui";

// Confirmation before a post is deleted. Can't be dismissed mid-delete.
export default function BlogDeleteDialog({ title, onClose, onConfirm }: { title: string | null; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const close = () => {
    if (!busy) onClose();
  };

  return (
    <Sheet open={title !== null} onClose={close} title="Delete this blog?">
      <div className="flex flex-col gap-4 pb-2">
        <p className="rounded-card border p-3 font-semibold">{title}</p>
        <p className="text-[15px] text-muted-foreground">It will disappear from the website straight away. This action cannot be undone.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={busy} onClick={close} className={`${button("outline", "lg")} disabled:opacity-50`}>
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className={`${button("primary", "lg")} bg-red-700 hover:bg-red-800 disabled:opacity-70`}
          >
            {busy ? <SpinnerGapIcon size={20} className="animate-spin" /> : <TrashIcon size={20} />}
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
