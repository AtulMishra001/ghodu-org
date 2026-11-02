"use client";

import { motion } from "motion/react";

// Desktop-only ribbon of what the valley grows, drifting slowly.
export default function ProduceMarquee({ names }: { names: string[] }) {
  const row = [...names, ...names];
  return (
    <div className="mx-auto hidden w-full max-w-[1800px] px-4 md:px-6 xl:px-10 overflow-hidden pt-10 md:block" aria-hidden>
      <div className="relative overflow-hidden border-y py-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex w-max gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {row.map((name, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-2xl italic text-muted-foreground">
              {name}
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
