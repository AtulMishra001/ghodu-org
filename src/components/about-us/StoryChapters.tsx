"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import SectionHeader from "@/components/shared/SectionHeader";
import Section from "@/components/shared/Section";
import type { AboutContent } from "@/data/about";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";

const ease = [0.22, 1, 0.36, 1] as const;

type Story = AboutContent["story"];

// Phone: swipe through chapters like stories. Large screens: the section pins and
// scrolling turns the pages, with a year rail to jump between them.
export default function StoryChapters({ story }: { story: Story }) {
  return (
    <>
      <PinnedChapters story={story} />
      <SwipeChapters story={story} />
    </>
  );
}

function PinnedChapters({ story }: { story: Story }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { chapters } = story;
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
  });

  function jump(i: number) {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / chapters.length) * distance });
  }

  const chapter = chapters[active];

  return (
    <div ref={track} id="story" className="hidden lg:block" style={{ height: `${chapters.length * 80}svh` }}>
      <div className="sticky top-[72px] h-[calc(100svh-72px)] px-6 pt-10 pb-6 xl:px-10">
        <div className="mx-auto grid h-full max-w-[1720px] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden rounded-card bg-inverse text-inverse-foreground">
          <div className="flex min-h-0 flex-col p-8 xl:p-10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="tabular">01</span>
              <span className="h-px w-6 bg-accent/60" />
              Our story
            </p>
            <h2 className="mt-2 max-w-md text-lg text-inverse-foreground/75">{story.title}</h2>

            <div className="flex min-h-0 flex-1 flex-col justify-center py-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter.year}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <p className="font-display text-[88px] leading-none font-medium text-accent tabular xl:text-[120px]">{chapter.year}</p>
                  <h3 className="mt-4 font-display text-[32px] leading-[1.1] font-medium tracking-tight xl:text-[44px]">{chapter.title}</h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-inverse-foreground/80 xl:text-lg">{chapter.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative border-t border-inverse-foreground/20 pt-3">
              <motion.span
                style={{ scaleX: scrollYProgress }}
                className="absolute inset-x-0 -top-px h-0.5 origin-left bg-accent"
              />
              <ul className="flex justify-between gap-2">
                {chapters.map((c, i) => (
                  <li key={c.year}>
                    <button
                      type="button"
                      aria-current={i === active ? "step" : undefined}
                      onClick={() => jump(i)}
                      className={`py-1 text-sm font-semibold tabular transition-colors ${
                        i === active ? "text-accent" : "text-inverse-foreground/55 hover:text-inverse-foreground"
                      }`}
                    >
                      {c.year}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative min-h-0">
            {chapters.map((c, i) => (
              <motion.div
                key={c.year}
                aria-hidden={i !== active}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.07 }}
                transition={{ duration: 0.9, ease }}
                className="absolute inset-0"
              >
                <Image {...photoProps(c.image)} alt={c.image.alt} fill sizes="60vw" className="object-cover" />
              </motion.div>
            ))}
            <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-inverse/50 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeChapters({ story }: { story: Story }) {
  const rail = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const { chapters } = story;

  function onScroll() {
    const box = rail.current;
    const card = box?.firstElementChild as HTMLElement | null;
    if (!box || !card) return;
    const next = Math.round(box.scrollLeft / (card.offsetWidth + 12));
    if (next !== active) {
      haptic(4);
      setActive(next);
    }
  }

  function go(i: number) {
    const box = rail.current;
    const card = box?.children[i] as HTMLElement | undefined;
    if (box && card) box.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  }

  return (
    <Section id="story-mobile" className="lg:hidden">
      <SectionHeader index="01" kicker="Our story" title={story.title} summary={story.summary} />

      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Chapters">
        {chapters.map((c, i) => (
          <button
            key={c.year}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={c.year}
            onClick={() => go(i)}
            className="flex-1 py-2"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-surface-muted">
              <span
                className={`block h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-premium ${
                  i <= active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      <ul ref={rail} onScroll={onScroll} className="rail -mx-4 mt-2 scroll-px-4 gap-3 px-4 md:-mx-6 md:px-6">
        {chapters.map((c, i) => (
          <li key={c.year} className="relative isolate flex h-[440px] w-[84%] shrink-0 flex-col justify-end overflow-hidden rounded-card bg-inverse p-5 text-inverse-foreground sm:w-[62%]">
            <Image
              {...photoProps(c.image)}
              alt={c.image.alt}
              fill
              sizes="(min-width: 640px) 62vw, 84vw"
              className={`-z-20 object-cover transition-transform duration-[1200ms] ease-premium ${i === active ? "scale-100" : "scale-110"}`}
            />
            <span className="absolute inset-0 -z-10 bg-linear-to-t from-inverse via-inverse/55 to-transparent" />
            <p className="font-display text-[56px] leading-none font-medium text-accent tabular">{c.year}</p>
            <h3 className="mt-2 font-display text-2xl leading-tight font-medium">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-inverse-foreground/85">{c.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
