"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { CaretDownIcon } from "@phosphor-icons/react";
import SectionHeader from "@/components/shared/SectionHeader";
import Section from "@/components/shared/Section";
import type { AboutContent } from "@/data/about";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";

const rowColumns = "lg:gap-x-8 lg:grid-cols-[minmax(0,1.15fr)_20rem_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.15fr)_24rem_minmax(0,1fr)]";

// Large screens: hover a row and its photo glides along the centre column, tilting
// with the cursor's speed. Phones: rows open like an accordion, with the photo inside.
export default function StandardsList({ standards }: Pick<AboutContent, "standards">) {
  const list = useRef<HTMLUListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(0);

  const pointerY = useMotionValue(0);
  const y = useSpring(pointerY, { stiffness: 220, damping: 26, mass: 0.6 });
  const velocity = useVelocity(y);
  const rotate = useTransform(velocity, [-1500, 1500], [-5, 5], { clamp: true });

  function onPointerMove(e: PointerEvent<HTMLUListElement>) {
    const box = list.current?.getBoundingClientRect();
    if (box) pointerY.set(e.clientY - box.top);
  }

  return (
    <Section id="standards">
      <SectionHeader index="04" kicker="Higher standards" title={standards.title} />

      <div className="relative mt-5 md:mt-6">
        <ul
          ref={list}
          onPointerMove={onPointerMove}
          onPointerEnter={(e) => {
            const box = list.current?.getBoundingClientRect();
            if (box) y.jump(e.clientY - box.top);
          }}
          onMouseLeave={() => setHovered(null)}
          className="border-t"
        >
          {standards.items.map((item, i) => {
            const expanded = open === i;
            const dimmed = hovered !== null && hovered !== i;
            return (
              <li
                key={item.title}
                onMouseEnter={() => setHovered(i)}
                className={`grid border-b transition-opacity duration-300 lg:items-center ${rowColumns} ${dimmed ? "lg:opacity-40" : ""}`}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => {
                    haptic(5);
                    setOpen(expanded ? -1 : i);
                  }}
                  className="flex w-full items-center gap-3 py-4 text-left md:gap-5 lg:cursor-default lg:py-8 xl:py-10"
                >
                  <span className="text-sm font-semibold text-primary tabular">0{i + 1}</span>
                  <span
                    className={`flex-1 font-display text-[26px] leading-tight font-medium tracking-tight transition-transform duration-500 ease-premium md:text-[36px] xl:text-[44px] ${
                      hovered === i ? "lg:translate-x-3" : ""
                    }`}
                  >
                    {item.title}
                  </span>
                  <CaretDownIcon size={18} className={`shrink-0 text-muted-foreground transition-transform duration-300 lg:hidden ${expanded ? "rotate-180" : ""}`} />
                </button>

                <span className="hidden lg:block" />

                <div className={`grid transition-[grid-template-rows] duration-500 ease-premium lg:grid-rows-[1fr] ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-3 text-[15px] leading-relaxed text-muted-foreground lg:pb-0 lg:text-lg">{item.body}</p>
                    <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-card lg:hidden">
                      <Image {...photoProps(item.image)} alt={item.image.alt} fill sizes="100vw" className="object-cover" />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* The gliding photo, in the rows' empty centre column */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 hidden lg:grid ${rowColumns}`}>
          <span />
          <motion.div
            style={{ y, rotate }}
            animate={{ opacity: hovered === null ? 0 : 1, scale: hovered === null ? 0.9 : 1 }}
            transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.4 } }}
            className="relative z-10 -mt-[9rem] aspect-[5/4] h-fit w-full self-start overflow-hidden rounded-card shadow-elevated xl:-mt-[10rem]"
          >
            {standards.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={false}
                animate={{ opacity: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image {...photoProps(item.image)} alt="" fill sizes="24rem" className="object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
