"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { ContactContent } from "@/data/contact";

// A line draws through the three steps as they scroll into view:
// across on large screens, down on phones.
export default function NextSteps({ steps }: Pick<ContactContent, "steps">) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.6"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <Section id="next">
      <SectionHeader index="03" kicker="After you send it" title="What happens next" />

      <ol ref={ref} className="relative mt-5 grid gap-5 md:mt-6 md:grid-cols-3 md:gap-6">
        <span aria-hidden className="absolute top-0 bottom-0 left-5 w-px bg-border md:top-5 md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto" />
        <motion.span
          aria-hidden
          style={{ scaleY: drawn }}
          className="absolute top-0 bottom-0 left-5 w-0.5 origin-top bg-primary motion-reduce:scale-100! md:hidden"
        />
        <motion.span
          aria-hidden
          style={{ scaleX: drawn }}
          className="absolute top-5 right-0 left-0 hidden h-0.5 origin-left bg-primary motion-reduce:scale-100! md:block"
        />
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground tabular">{i + 1}</span>
            <span>
              <span className="block font-display text-[22px] leading-tight font-medium md:text-[28px]">{step.title}</span>
              <span className="mt-1 block text-[15px] text-muted-foreground md:text-base">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
