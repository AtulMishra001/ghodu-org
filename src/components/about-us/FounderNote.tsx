"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Section from "@/components/shared/Section";
import type { AboutContent } from "@/data/about";
import type { Photo } from "@/data/photos";
import { photoProps } from "@/lib/photo";

// The founder's note lights up word by word as it scrolls through the screen,
// with small photos set into the sentence.
export default function FounderNote({ note }: Pick<AboutContent, "note">) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });

  const tokens = note.lines.flatMap((line) => ("text" in line ? line.text.split(" ") : [line.photo as Photo | string]));

  return (
    <Section id="note">
      <figure className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,5fr)] lg:gap-10">
        <p className="flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.18em] text-primary lg:pt-4">
          <span className="tabular">02</span>
          <span className="h-px w-6 bg-primary/40" />A note
        </p>
        <div>
          <blockquote>
            <p ref={ref} className="font-display text-[30px] leading-[1.22] font-medium tracking-tight md:text-[44px] xl:text-[60px] 2xl:text-[72px]">
              {tokens.map((token, i) => {
                const range: [number, number] = [i / tokens.length, (i + 1) / tokens.length];
                if (typeof token === "string") {
                  return <Word key={i} progress={scrollYProgress} range={range} text={token} />;
                }
                return <InlinePhoto key={i} progress={scrollYProgress} range={range} photo={token} />;
              })}
            </p>
          </blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-muted-foreground md:text-base">{note.attribution}</figcaption>
        </div>
      </figure>
    </Section>
  );
}

function Word({ progress, range, text }: { progress: MotionValue<number>; range: [number, number]; text: string }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className="motion-reduce:opacity-100!">
        {text}
      </motion.span>{" "}
    </>
  );
}

function InlinePhoto({
  progress,
  range,
  photo,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  photo: Photo;
}) {
  const width = useTransform(progress, range, ["0.6em", "1.8em"]);
  const opacity = useTransform(progress, range, [0.3, 1]);
  return (
    <>
      <motion.span
        aria-hidden
        style={{ width, opacity }}
        className="relative inline-block h-[0.82em] translate-y-[0.1em] overflow-hidden rounded-full bg-surface-muted motion-reduce:w-[1.8em]! motion-reduce:opacity-100!"
      >
        <Image {...photoProps(photo)} alt="" fill sizes="140px" className="object-cover" />
      </motion.span>{" "}
    </>
  );
}
