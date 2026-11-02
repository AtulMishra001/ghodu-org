"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ArrowCounterClockwiseIcon, ArrowRightIcon, BasketIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { useQuote } from "@/components/shared/QuoteProvider";
import type { AboutContent } from "@/data/about";
import type { Photo } from "@/data/photos";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";
import { button } from "@/lib/ui";

type Slide = { group: string; photo?: Photo; shade?: string; body: ReactNode };

const title = "font-display text-[32px] leading-[1.08] font-medium tracking-tight text-balance";
const kicker = "text-xs font-semibold uppercase tracking-[0.16em] text-accent";

// The phone's About page: the story as full-screen chapters you tap through, like
// stories in a messaging app, with no page scroll. Nothing advances on its own,
// because a buyer should read at their own speed. Every slide's text stays in the
// page, and only the photos near the current slide load.
export default function AboutStories({ content }: { content: AboutContent }) {
  const quote = useQuote();
  const { hero, story, note, journey, standards, numbers, faqs, closing } = content;
  const [index, setIndex] = useState(0);
  const press = useRef<{ x: number; y: number; time: number } | null>(null);

  const noteText = note.lines.flatMap((line) => ("text" in line ? [line.text] : [])).join(" ");

  const slides: Slide[] = [
    {
      group: "Story",
      photo: hero.image,
      body: (
        <>
          <p className={kicker}>{hero.eyebrow}</p>
          <h1 className="mt-2 font-display text-[38px] leading-[1.04] font-medium tracking-tight text-balance">
            {hero.titleStart} <span className="italic text-accent">{hero.titleAccent}</span> {hero.titleEnd}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-inverse-foreground/90">{hero.summary}</p>
          <p className="mt-4 text-xs font-semibold text-inverse-foreground/75">Tap to continue</p>
        </>
      ),
    },
    ...story.chapters.map((c): Slide => ({
      group: "Story",
      photo: c.image,
      body: (
        <>
          <p className="font-display text-[64px] leading-none font-medium text-accent tabular">{c.year}</p>
          <h2 className={`mt-2 ${title}`}>{c.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inverse-foreground/90">{c.body}</p>
        </>
      ),
    })),
    {
      group: "Story",
      photo: story.chapters[0]?.image,
      shade: "bg-inverse/85",
      body: (
        <figure>
          <blockquote className="font-display text-[28px] leading-[1.2] font-medium text-balance">{noteText}</blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-accent">{note.attribution}</figcaption>
        </figure>
      ),
    },
    ...journey.stages.map((stage, i): Slide => ({
      group: "How it works",
      photo: stage.image,
      body: (
        <>
          <p className={kicker}>
            Step {i + 1} of {journey.stages.length} · {stage.name}
          </p>
          <h2 className={`mt-2 ${title}`}>{stage.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inverse-foreground/90">{stage.body}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {stage.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-inverse-foreground/30 px-2.5 py-1 text-xs font-semibold">
                {tag}
              </li>
            ))}
          </ul>
        </>
      ),
    })),
    {
      group: "Standards",
      photo: standards.items[0]?.image,
      shade: "bg-inverse/90",
      body: (
        <>
          <h2 className={title}>{standards.title}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {standards.items.map((item) => (
              <li key={item.title} className="border-t border-inverse-foreground/20 pt-3">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-inverse-foreground/85">{item.body}</p>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      group: "Standards",
      photo: numbers.image,
      shade: "bg-inverse/85",
      body: (
        <>
          <h2 className={title}>{numbers.title}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
            {numbers.stats.map((stat) => (
              <li key={stat.label} className="border-t border-inverse-foreground/25 pt-3">
                <p className="font-display text-[42px] leading-none font-medium text-accent tabular">
                  {stat.value.toLocaleString("en-IN")}
                  {stat.suffix}
                </p>
                <p className="mt-1.5 text-sm text-inverse-foreground/85">{stat.label}</p>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      group: "Questions",
      body: (
        // The one slide on a light surface, because it's for looking things up.
        <div data-scrolls className="-mx-4 flex max-h-full min-h-0 flex-col rounded-t-card bg-background px-4 pt-4 text-foreground">
          <h2 className="font-display text-[26px] leading-tight font-medium">Getting to know us</h2>
          <div className="mt-2 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-16">
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      ),
    },
    {
      group: "Join us",
      photo: closing.columns[0]?.[0],
      body: (
        <>
          <h2 className={title}>
            {closing.titleStart} <span className="italic text-accent">{closing.titleAccent}</span>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inverse-foreground/90">{closing.summary}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={() => quote.open()} className={`${button("accent", "lg")} w-full`}>
              <BasketIcon size={20} weight="duotone" />
              Start an enquiry
            </button>
            <Link href="/products" className={`${button("outline-inverse", "lg")} w-full`}>
              View catalogue
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </>
      ),
    },
  ];

  const groups = [...new Set(slides.map((s) => s.group))];
  const last = slides.length - 1;
  const atEnd = index === last;

  function go(next: number) {
    if (next < 0 || next > last || next === index) return;
    haptic(5);
    setIndex(next);
  }

  function onPointerDown(e: PointerEvent) {
    press.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
  }

  // A sideways swipe moves either way. A quick tap moves too: the left third goes back.
  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const start = press.current;
    press.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) return go(index + (dx < 0 ? 1 : -1));
    const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && e.timeStamp - start.time < 400;
    if (!isTap || (e.target as HTMLElement).closest("a, button, [data-scrolls]")) return;
    const box = e.currentTarget.getBoundingClientRect();
    go(index + (e.clientX - box.left < box.width / 3 ? -1 : 1));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  }

  return (
    <section
      data-fullscreen
      aria-roledescription="carousel"
      aria-label="The Ghodu Agro story"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (press.current = null)}
      onKeyDown={onKeyDown}
      className="relative isolate h-app-screen touch-pan-y select-none overflow-hidden bg-inverse text-inverse-foreground outline-none md:hidden"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            inert={!active}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-500 ease-premium ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {slide.photo && Math.abs(i - index) <= 1 && (
              <Image
                {...photoProps(slide.photo)}
                alt={slide.photo.alt}
                fill
                sizes="100vw"
                {...(i === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
                className={`-z-20 object-cover transition-transform duration-[6000ms] ease-out motion-reduce:transition-none ${active ? "scale-100" : "scale-[1.08]"}`}
              />
            )}
            <div className={`absolute inset-0 -z-10 ${slide.shade ?? "bg-linear-to-t from-inverse from-25% via-inverse/80 via-55% to-inverse/30"}`} />
            {/* Clears the progress bars at the top and the arrows at the bottom. */}
            <div
              className={`flex min-h-0 flex-col justify-end px-4 pt-20 transition-[translate] duration-500 ease-premium motion-reduce:transition-none ${
                active ? "translate-y-0" : "translate-y-3"
              } ${slide.photo ? "pb-16" : "max-h-full flex-1"}`}
            >
              {slide.body}
            </div>
          </div>
        );
      })}

      {/* ---------- progress: one bar per part, filling as its slides go by ---------- */}
      <nav aria-label="Story parts" className="absolute inset-x-0 top-0 flex gap-1 px-3 pt-2.5">
        {groups.map((group) => {
          const first = slides.findIndex((s) => s.group === group);
          const size = slides.filter((s) => s.group === group).length;
          const done = Math.min(Math.max(index - first + 1, 0), size);
          const current = index >= first && index < first + size;
          return (
            <button key={group} type="button" onClick={() => go(first)} aria-current={current ? "step" : undefined} className="min-w-0 flex-1 text-left">
              <span className="block h-[3px] overflow-hidden rounded-full bg-inverse-foreground/30">
                <span className="block h-full rounded-full bg-accent transition-[width] duration-300 ease-premium" style={{ width: `${(done / size) * 100}%` }} />
              </span>
              <span className={`mt-1 block truncate text-[10px] font-semibold [text-shadow:0_1px_3px_rgb(0_0_0/0.5)] ${current ? "" : "text-inverse-foreground/70"}`}>{group}</span>
            </button>
          );
        })}
      </nav>

      {/* Moves up onto the dark band on the Questions slide, where it would cover the answers. */}
      <div className={`absolute right-3 flex gap-2 ${slides[index].photo ? "bottom-3" : "top-9"}`}>
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous" className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-card transition active:scale-90 disabled:opacity-0">
          <CaretLeftIcon size={18} weight="bold" />
        </button>
        {atEnd ? (
          <button type="button" onClick={() => go(0)} aria-label="Back to the start" className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-card transition active:scale-90">
            <ArrowCounterClockwiseIcon size={18} weight="bold" />
          </button>
        ) : (
          <button type="button" onClick={() => go(index + 1)} aria-label="Next" className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-card transition active:scale-90">
            <CaretRightIcon size={18} weight="bold" />
          </button>
        )}
      </div>
    </section>
  );
}
