"use client";

import { useState } from "react";
import { SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";
import { Sheet } from "@/components/shared/Sheet";
import CoverThumb from "./CoverThumb";
import type { AdminProduct } from "@/lib/server/products";
import { button } from "@/lib/ui";

// Confirmation before a product (and its photo) is deleted for good.
export default function DeleteDialog({
  product,
  onClose,
  onConfirm,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onConfirm: (p: AdminProduct) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Sheet open={!!product} onClose={() => !busy && onClose()} title={product ? `Delete ${product.name}?` : ""}>
      {product && (
        <div className="flex flex-col gap-5 pb-2">
          <div className="flex items-center gap-3 rounded-card border p-3">
            <CoverThumb product={product} className="size-14 rounded-tile" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{product.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {product.category} · {product.forms.join(", ")}
              </p>
            </div>
          </div>
          <p className="text-[15px] text-muted-foreground">
            It will disappear from the website straight away and its photos will be deleted from Cloudinary. This can&apos;t be undone — to take it
            down for a while, switch it to hidden instead.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy} onClick={onClose} className={button("outline", "lg")}>
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm(product);
                } finally {
                  setBusy(false);
                }
              }}
              className={`${button("primary", "lg")} bg-red-700 hover:bg-red-800 disabled:opacity-70`}
            >
              {busy ? <SpinnerGapIcon size={20} className="animate-spin" /> : <TrashIcon size={20} />}
              Delete
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
