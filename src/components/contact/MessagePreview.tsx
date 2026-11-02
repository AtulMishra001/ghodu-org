"use client";

import { motion } from "motion/react";
import { site } from "@/data/site";

// The enquiry as it will be received, in a chat bubble that grows as the form fills in.
export default function MessagePreview({ message, className }: { message: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">Your message to {site.shortName}</p>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-card rounded-bl-sm bg-background px-4 py-3 text-foreground shadow-elevated"
      >
        <motion.p layout="position" aria-live="off" className="text-sm leading-relaxed break-words whitespace-pre-line">
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}
