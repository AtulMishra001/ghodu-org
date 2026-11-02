"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { CaretLeftIcon, ListBulletsIcon, PaperPlaneTiltIcon, ShareNetworkIcon, TextAaIcon } from "@phosphor-icons/react";
import { useGoBack } from "@/components/shared/AppBar";
import { Sheet } from "@/components/shared/Sheet";
import { useToast } from "@/components/shared/Toast";
import type { TocGroup } from "@/lib/blog-html";
import { haptic } from "@/lib/haptics";
import { shareLink } from "@/lib/share";
import PostEnquiryForm from "./PostEnquiryForm";
import TableOfContents from "./TableOfContents";

const sizes = [
  { scale: 1, label: "Normal" },
  { scale: 1.125, label: "Large" },
  { scale: 1.25, label: "Larger" },
];

/** How far through the article you are, as a hairline along the top of the phone screen. */
export function ReaderProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <div aria-hidden className="sticky top-0 z-30 h-[3px] bg-surface-muted md:hidden" style={{ marginTop: "env(safe-area-inset-top)" }}>
      <motion.div style={{ scaleX }} className="h-full origin-left bg-primary motion-reduce:transition-none" />
    </div>
  );
}

// The phone's reading controls, replacing the site's bars while reading. Slips
// away on the way down so the text gets the whole screen, and comes back on any
// scroll up or at the end of the article.
export default function ReaderBar({ title, slug, toc }: { title: string; slug: string; toc: TocGroup[] }) {
  const goBack = useGoBack();
  const toast = useToast();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [sheet, setSheet] = useState<"contents" | "enquiry" | null>(null);
  const [size, setSize] = useState(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 60;
    if (atEnd || y < prev - 6 || y < 120) setHidden(false);
    else if (y > prev + 6) setHidden(true);
  });

  function changeSize() {
    haptic(5);
    const next = (size + 1) % sizes.length;
    setSize(next);
    document.documentElement.style.setProperty("--reader-scale", String(sizes[next].scale));
    toast(`Text size: ${sizes[next].label}`);
  }

  async function share() {
    haptic(5);
    const result = await shareLink(title);
    if (result === "copied") toast("Link copied");
    if (result === "failed") toast("Couldn't copy the link");
  }

  const tool = "flex h-12 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition active:scale-90";

  return (
    <>
      <motion.nav
        aria-label="Reading controls"
        initial={false}
        animate={{ y: hidden ? "110%" : "0%" }}
        transition={{ type: "spring", stiffness: 420, damping: 40 }}
        className="sticky bottom-0 z-30 border-t bg-background shadow-float md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button type="button" onClick={goBack} className={tool}>
            <CaretLeftIcon size={20} weight="bold" className="text-foreground" />
            Back
          </button>
          {toc.length > 0 && (
            <button type="button" onClick={() => setSheet("contents")} className={tool}>
              <ListBulletsIcon size={20} className="text-foreground" />
              Contents
            </button>
          )}
          <button type="button" onClick={changeSize} aria-label={`Text size: ${sizes[size].label}. Change text size`} className={tool}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={size} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="grid">
                <TextAaIcon size={[20, 22, 24][size]} className="text-foreground" />
              </motion.span>
            </AnimatePresence>
            Text
          </button>
          <button type="button" onClick={share} className={tool}>
            <ShareNetworkIcon size={20} className="text-foreground" />
            Share
          </button>
          <button
            type="button"
            onClick={() => setSheet("enquiry")}
            className="ml-1 flex h-11 shrink-0 items-center gap-1.5 rounded-control bg-primary px-3 text-sm font-semibold text-primary-foreground transition active:scale-95"
          >
            <PaperPlaneTiltIcon size={18} />
            Enquire
          </button>
        </div>
      </motion.nav>

      {/* Outside the bar: its transform would otherwise trap these fixed sheets. */}
      <Sheet open={sheet === "contents"} onClose={() => setSheet(null)} title="In this article">
        {/* Closes as a link in the list is followed. */}
        <div className="pb-2 [&>nav]:border-0 [&>nav]:p-0 [&>nav>h2]:sr-only" onClick={(e) => (e.target as HTMLElement).closest("a") && setSheet(null)}>
          <TableOfContents groups={toc} />
        </div>
      </Sheet>
      <Sheet open={sheet === "enquiry"} onClose={() => setSheet(null)} title="Ask about this">
        <div className="pb-2 [&>*]:border-0 [&>*]:p-0">
          <PostEnquiryForm slug={slug} />
        </div>
      </Sheet>
    </>
  );
}
