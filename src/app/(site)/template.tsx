"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { takeNavDirection } from "@/lib/nav-direction";

// Re-mounts on every navigation: tabs to the right slide in from the right,
// tabs to the left (and Back) from the left; anything else rises into place.
export default function Template({ children }: { children: ReactNode }) {
  const [dir] = useState(takeNavDirection);

  return (
    <motion.div
      initial={{ opacity: 0, x: dir * 36, y: dir === 0 ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 36, mass: 0.9 }}
    >
      {children}
    </motion.div>
  );
}
