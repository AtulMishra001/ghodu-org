"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";

// Counts up when scrolled into view. The real number is in the DOM for
// crawlers and screen readers; the animated copy is aria-hidden.
export function CountUp({ to, suffix = "", locale = "en" }: { to: number; suffix?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => `${Math.round(v).toLocaleString(locale)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, reduce, to, value]);

  return (
    <span ref={ref} className="tabular">
      <span className="sr-only">
        {to.toLocaleString(locale)}
        {suffix}
      </span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}
