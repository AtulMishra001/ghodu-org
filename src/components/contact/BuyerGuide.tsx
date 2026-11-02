"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowUpIcon, CheckIcon } from "@phosphor-icons/react";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { ContactContent } from "@/data/contact";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";
import { button } from "@/lib/ui";
import { useContactForm } from "./ContactProvider";

const ease = [0.22, 1, 0.36, 1] as const;

// Pick (or on phones, swipe to) a type of buyer to see what's worth mentioning.
// The button sets up the matching enquiry in the form at the top of the page.
export default function BuyerGuide({ buyers }: Pick<ContactContent, "buyers">) {
  const { types } = buyers;
  const { chooseIntent, goToForm } = useContactForm();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const buyer = types[index];
  const rail = useRef<HTMLDivElement>(null);

  // Keep the chosen tab in view after a swipe: scroll the rail only, never the page.
  useEffect(() => {
    const box = rail.current;
    const tab = box?.children[index] as HTMLElement | undefined;
    if (box && tab) box.scrollTo({ left: tab.offsetLeft - box.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  function go(next: number) {
    if (next < 0 || next >= types.length || next === index) return;
    haptic(5);
    setDir(next > index ? 1 : -1);
    setIndex(next);
  }

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
  }

  return (
    <Section id="buyers">
      <SectionHeader index="02" kicker="Your business" title={buyers.title} summary={buyers.summary} />

      <div ref={rail} role="group" aria-label="Type of buyer" className="rail relative -mx-4 mt-5 scroll-px-4 gap-1.5 px-4 md:mx-0 md:mt-6 md:gap-2 md:px-0">
        {types.map((t, i) => {
          const active = i === index;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => go(i)}
              className={`relative h-11 shrink-0 rounded-control px-4 text-sm font-semibold transition-colors md:h-12 md:px-5 md:text-[15px] ${
                active ? "text-primary-foreground" : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="buyer-tab"
                  className="absolute inset-0 rounded-control bg-primary"
                  transition={{ type: "spring", stiffness: 480, damping: 40 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        dragDirectionLock
        onDragEnd={onSwipe}
        className="mt-3 grid touch-pan-y overflow-hidden rounded-card border bg-surface md:mt-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="relative h-52 overflow-hidden bg-inverse sm:h-72 lg:h-auto lg:min-h-[480px]">
          {types.map((t, i) => (
            <motion.div
              key={t.id}
              aria-hidden={i !== index}
              initial={false}
              animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.06 }}
              transition={{ duration: 0.8, ease }}
              className="absolute inset-0"
            >
              <Image {...photoProps(t.image)} alt={i === index ? t.image.alt : ""} fill draggable={false} sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="relative min-w-0 overflow-hidden p-5 md:p-8 xl:p-10">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={buyer.id}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 28 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -28 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease }}
              className="flex h-full flex-col"
            >
              <h3 className="font-display text-[26px] leading-[1.1] font-medium tracking-tight md:text-[36px] xl:text-[44px]">{buyer.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:text-lg">{buyer.body}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary md:mt-6">Worth mentioning</p>
              <ul className="mt-2 flex flex-col gap-2">
                {buyer.mention.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.07, ease }}
                    className="flex items-start gap-2.5 text-[15px] font-semibold md:text-base"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                      <CheckIcon size={12} weight="bold" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 lg:mt-auto lg:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    chooseIntent(buyer.intentId);
                    goToForm();
                  }}
                  className={`${button("primary", "lg")} w-full sm:w-auto`}
                >
                  <ArrowUpIcon size={18} />
                  {buyer.action}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-2 flex justify-center gap-1.5 md:hidden" aria-hidden>
        {types.map((t, i) => (
          <span key={t.id} className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`} />
        ))}
      </div>
    </Section>
  );
}
