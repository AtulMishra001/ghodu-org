"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "motion/react";
import { ArrowDownIcon } from "@phosphor-icons/react";
import type { AboutContent } from "@/data/about";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
});

// The page opens on a window into the valley. Scrolling pins the stage and the
// window grows until the photo fills the screen, handing over to one line of story.
// The window's starting size per breakpoint lives in the --clip-* classes below.
export default function AboutHero({ hero }: Pick<AboutContent, "hero">) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 0 : v));

  const closed = useTransform(progress, [0.04, 0.72], [1, 0]);
  const zoom = useTransform(progress, [0, 0.8], [1.14, 1]);
  const introOpacity = useTransform(progress, [0, 0.3], [1, 0]);
  const introY = useTransform(progress, [0, 0.3], [0, -36]);
  const shade = useTransform(progress, [0.45, 0.75], [0, 1]);
  const statementOpacity = useTransform(progress, [0.62, 0.82], [0, 1]);
  const statementY = useTransform(progress, [0.62, 0.82], [24, 0]);

  return (
    <div ref={track} className="h-[220svh] motion-reduce:h-auto">
      <section className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden md:top-[72px] md:h-[calc(100svh-72px)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute inset-0 [--clip-b:11%] [--clip-t:50%] [--clip-x:4%] lg:[--clip-b:4%] lg:[--clip-t:39%] lg:[--clip-x:21%]"
        >
          <motion.div
            style={
              {
                "--closed": closed,
                clipPath:
                  "inset(calc(var(--clip-t) * var(--closed)) calc(var(--clip-x) * var(--closed)) calc(var(--clip-b) * var(--closed)) round calc(1rem * var(--closed)))",
              } as MotionStyle
            }
            className="absolute inset-0 overflow-hidden bg-inverse"
          >
            <motion.div style={{ scale: zoom }} className="absolute inset-0">
              <Image {...photoProps(hero.image)} alt={hero.image.alt} fill sizes="100vw" priority className="object-cover" />
            </motion.div>
            <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-linear-to-t from-inverse/85 via-inverse/20 to-transparent" />
          </motion.div>
        </motion.div>

        {/* ---------- Before the window opens ---------- */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 top-0 flex h-1/2 flex-col justify-center px-4 md:px-6 lg:h-[39%] lg:items-center lg:text-center xl:px-10"
        >
          <motion.p {...rise(0.05)} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-primary/50" />
            {hero.eyebrow}
            <span className="hidden h-px w-6 bg-primary/50 lg:block" />
          </motion.p>
          <motion.h1
            {...rise(0.12)}
            className="mt-3 font-display text-[38px] leading-[1.04] font-medium tracking-tight text-balance md:text-[56px] lg:text-[64px] xl:text-[72px] 2xl:text-[88px]"
          >
            {hero.titleStart} <span className="italic text-primary">{hero.titleAccent}</span> {hero.titleEnd}
          </motion.h1>
          <motion.p {...rise(0.25)} className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground lg:hidden">
            {hero.summary}
          </motion.p>
        </motion.div>

        {/* Either side of the window on large screens */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[4%] mx-auto hidden max-w-[1800px] items-end justify-between px-6 lg:flex xl:px-10"
        >
          <motion.p {...rise(0.35)} className="w-[17%] text-sm leading-relaxed text-muted-foreground xl:text-base">
            {hero.summary}
          </motion.p>
          <motion.p {...rise(0.45)} className="flex items-center gap-2 text-sm font-semibold">
            Scroll into the story
            <motion.span
              animate={reduce ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="grid size-9 place-items-center rounded-full border"
            >
              <ArrowDownIcon size={16} />
            </motion.span>
          </motion.p>
        </motion.div>

        {/* ---------- After it opens ---------- */}
        <motion.div
          style={{ opacity: statementOpacity, y: statementY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1800px] px-4 pb-8 text-inverse-foreground md:px-6 md:pb-10 xl:px-10"
        >
          <p className="max-w-4xl font-display text-[32px] leading-[1.08] font-medium tracking-tight text-balance md:text-[52px] xl:text-[64px]">
            {hero.statement}
          </p>
          <p className="mt-3 text-sm text-inverse-foreground/80">{hero.caption}</p>
        </motion.div>
      </section>
    </div>
  );
}
