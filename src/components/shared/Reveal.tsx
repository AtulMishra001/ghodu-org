"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

// Fade-and-rise as a block enters the viewport, once. Tune `y` and the
// duration to the brief's motion personality (calm: y 10, 0.8s; snappy: y 24, 0.45s).
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
