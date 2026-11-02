"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { haptic } from "@/lib/haptics";
import { useMediaQuery } from "@/lib/use-media-query";

export type PagerTab = { id: string; label: string; node: ReactNode };

// Phones: one swipeable page per tab under a sticky tab strip, built on native
// scroll-snap so the swipe follows the finger. The pager takes the height of the
// current page, so a short tab never scrolls because a long one sits beside it.
// Desktop: the strip is gone and the same panels stack as ordinary sections.
export default function ProductPager({ tabs }: { tabs: PagerTab[] }) {
  const isPhone = useMediaQuery("(max-width: 767.98px)");
  const pager = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const current = useRef(0);
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const el = pager.current;
    if (!el?.clientWidth || !strip.current || !anchor.current) return;
    const progress = el.scrollLeft / el.clientWidth;
    const from = Math.max(0, Math.floor(progress));
    const to = Math.min(from + 1, el.children.length - 1);
    const fromHeight = (el.children[from] as HTMLElement).offsetHeight;
    const toHeight = (el.children[to] as HTMLElement).offsetHeight;
    el.style.setProperty("--pager-h", `${fromHeight + (toHeight - fromHeight) * (progress - from)}px`);
    if (indicator.current) indicator.current.style.transform = `translateX(${progress * 100}%)`;

    const next = Math.round(progress);
    if (next === current.current) return;
    current.current = next;
    setActive(next);
    haptic(5);
    // Each tab starts at its top, even if the last one was scrolled.
    const offset = anchor.current.getBoundingClientRect().top - parseFloat(getComputedStyle(strip.current).top);
    if (offset < 0) window.scrollBy({ top: offset, behavior: "instant" });
  }, []);

  // Runs once on mount, then whenever a panel changes height (images, FAQs opening).
  useEffect(() => {
    const el = pager.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    [...el.children].forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [sync]);

  function go(index: number) {
    const el = pager.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: index * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div className="flex-1">
      <div ref={anchor} aria-hidden />
      <nav
        ref={strip}
        aria-label="Product sections"
        className="sticky z-20 border-b bg-background md:hidden"
        style={{ top: "calc(3.5rem + env(safe-area-inset-top))" }}
      >
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              aria-current={i === active ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-11 px-1 text-[13px] whitespace-nowrap font-semibold transition-colors duration-200 ${
                i === active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span ref={indicator} aria-hidden className="absolute bottom-0 left-0 h-0.5 bg-primary" style={{ width: `${100 / tabs.length}%` }} />
        </div>
      </nav>

      <div ref={pager} onScroll={sync} className="max-md:rail max-md:h-(--pager-h) max-md:items-start max-md:overflow-y-hidden">
        {tabs.map((tab, i) => (
          // `relative` keeps the screen-reader headings inside the clipped panel; without it they widen the whole page.
          <div key={tab.id} inert={isPhone && i !== active} className="relative w-full shrink-0 max-md:[scroll-snap-stop:always]">
            {tab.node}
          </div>
        ))}
      </div>
    </div>
  );
}
