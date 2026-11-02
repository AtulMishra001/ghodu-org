"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import SectionHeader from "@/components/shared/SectionHeader";
import Section from "@/components/shared/Section";
import type { AboutContent } from "@/data/about";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;

// Expanding photo panels: side by side on large screens, stacked on phones.
// They play through on their own until the visitor hovers or taps one.
export default function JourneyPanels({ journey }: Pick<AboutContent, "journey">) {
  const { stages } = journey;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const autoplay = inView && !touched && !reduce;

  function pick(i: number) {
    setTouched(true);
    if (i !== active) {
      haptic(5);
      setActive(i);
    }
  }

  return (
    <Section id="journey">
      <SectionHeader
        index="03"
        kicker="How it works"
        title={
          <>
            {journey.title[0]} <span className="italic text-primary">{journey.title[1]}</span>
          </>
        }
        summary={journey.summary}
      />

      <div ref={ref} className="mt-5 flex h-[620px] flex-col gap-2 md:mt-6 lg:h-[560px] lg:flex-row xl:h-[640px]">
        {stages.map((stage, i) => {
          const open = i === active;
          return (
            <button
              key={stage.name}
              type="button"
              aria-expanded={open}
              onClick={() => pick(i)}
              onMouseEnter={() => pick(i)}
              onFocus={() => pick(i)}
              className={`group relative isolate min-h-0 min-w-0 overflow-hidden rounded-card bg-inverse text-left text-inverse-foreground transition-[flex-grow] duration-700 ease-premium ${
                open ? "grow-[5]" : "grow"
              } basis-0`}
            >
              <Image
                {...photoProps(stage.image)}
                alt={stage.image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`-z-20 object-cover transition-transform duration-[1400ms] ease-premium ${open ? "scale-100" : "scale-110"}`}
              />
              <span
                className={`absolute inset-0 -z-10 transition-colors duration-500 ${open ? "bg-inverse/10" : "bg-inverse/60 group-hover:bg-inverse/45"}`}
              />
              <span className={`absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/40 to-transparent transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />

              {/* Closed: the stage's name */}
              <span
                className={`absolute flex items-center gap-2 font-semibold transition-opacity duration-300 max-lg:inset-y-0 max-lg:left-4 lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 lg:rotate-180 lg:[writing-mode:vertical-rl] ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="text-sm text-accent tabular">0{i + 1}</span>
                <span className="font-display text-xl lg:text-2xl">{stage.name}</span>
              </span>

              {/* Open: the detail */}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease }}
                    className="absolute bottom-0 left-0 block w-[min(calc(100vw-2rem),28rem)] p-4 md:p-6 xl:w-[32rem] xl:p-8"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent tabular">
                      0{i + 1} · {stage.name}
                    </span>
                    <span className="mt-1 block font-display text-[26px] leading-[1.1] font-medium md:text-[34px] xl:text-[40px]">{stage.title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-inverse-foreground/85 md:text-base">{stage.body}</span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {stage.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-inverse-foreground/25 bg-inverse/30 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>

              {open && autoplay && (
                <motion.span
                  key={active}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => setActive((active + 1) % stages.length)}
                  className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>
    </Section>
  );
}
