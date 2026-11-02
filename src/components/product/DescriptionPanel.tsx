"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DescriptionHeading } from "@/lib/rich-text";

// The description as a self-contained card: its content scrolls inside, with
// the headings as tabs along the top. On desktop the card fills its grid row,
// so it always ends level with the enquiry form beside it. On phones the tab it
// sits in already gives it a screen of its own, so it's plain flowing text.
export default function DescriptionPanel({ label, outline, children }: { label: string; outline: DescriptionHeading[]; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(outline[0]?.id);
  const [atEnd, setAtEnd] = useState(true);

  function sync() {
    const el = scroller.current;
    if (!el) return;
    const end = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setAtEnd(end);
    if (!outline.length) return;
    // Current heading: the last one to reach the top of the panel.
    const line = el.getBoundingClientRect().top + 32;
    const passed = outline.filter((item) => (document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity) <= line);
    setActive(end ? outline[outline.length - 1].id : (passed[passed.length - 1] ?? outline[0]).id);
  }

  // Runs once on mount and again whenever images load or the layout resizes.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outline]);

  // Keep the current tab visible in the rail, without moving the page.
  useEffect(() => {
    const tab = rail.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (tab && rail.current) rail.current.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  function jump(id: string) {
    const el = scroller.current;
    const heading = document.getElementById(id);
    if (!el || !heading) return;
    const top = el.scrollTop + heading.getBoundingClientRect().top - el.getBoundingClientRect().top - 16;
    el.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <div className="flex flex-col overflow-hidden md:h-[32rem] md:rounded-card md:border md:bg-surface lg:absolute lg:inset-0 lg:h-auto">
      {outline.length > 0 && (
        <nav aria-label={`${label} sections`} className="shrink-0 border-b max-md:hidden">
          <div ref={rail} className="relative flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:px-3 [&::-webkit-scrollbar]:hidden">
            {outline.map((item) => {
              const current = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={current ? "location" : undefined}
                  onClick={() => jump(item.id)}
                  className={`relative h-12 max-w-[15rem] shrink-0 truncate px-2.5 text-sm font-semibold transition-colors duration-200 ${
                    current ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.text}
                  <span className={`absolute inset-x-2.5 bottom-0 h-0.5 bg-primary transition-opacity duration-200 ${current ? "opacity-100" : "opacity-0"}`} />
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={scroller}
          onScroll={sync}
          role="region"
          aria-label={label}
          tabIndex={0}
          className="description-panel px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset md:h-full md:overflow-y-auto md:p-6"
        >
          {children}
        </div>
        {/* Hints there's more below; clears once the end is reached. */}
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t max-md:hidden from-surface to-transparent transition-opacity duration-200 ${atEnd ? "opacity-0" : "opacity-100"}`} />
      </div>
    </div>
  );
}
