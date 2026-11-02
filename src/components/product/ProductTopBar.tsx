"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { BasketIcon, CaretLeftIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useGoBack } from "@/components/shared/AppBar";
import { useQuote } from "@/components/shared/QuoteProvider";
import { useToast } from "@/components/shared/Toast";
import { haptic } from "@/lib/haptics";
import { shareLink } from "@/lib/share";

const round = "grid size-10 shrink-0 place-items-center rounded-full transition active:scale-90";

// Phone only, and it replaces the site's app bar on this screen. The buttons
// float over the photo; once the photo has scrolled away the bar turns solid
// and shows the product's name.
export default function ProductTopBar({ name }: { name: string }) {
  const goBack = useGoBack();
  const quote = useQuote();
  const toast = useToast();
  const { scrollY } = useScroll();
  const bar = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);

  // Solid once the hero (the next block on the page) has gone under the bar.
  useMotionValueEvent(scrollY, "change", () => {
    const hero = bar.current?.nextElementSibling;
    if (hero && bar.current) setSolid(hero.getBoundingClientRect().bottom <= bar.current.offsetHeight + 1);
  });

  async function share() {
    haptic(5);
    const result = await shareLink(name);
    if (result === "copied") toast("Link copied");
    if (result === "failed") toast("Couldn't copy the link");
  }

  const floating = solid ? "" : "bg-background/90 shadow-card backdrop-blur";

  return (
    <div
      ref={bar}
      className={`sticky top-0 z-30 flex items-end transition-colors duration-200 md:hidden ${solid ? "bg-background" : ""}`}
      style={{
        height: "calc(3.5rem + env(safe-area-inset-top))",
        marginBottom: "calc(-3.5rem - env(safe-area-inset-top))",
      }}
    >
      <div className="flex h-14 w-full items-center gap-2 px-3">
        <button type="button" onClick={goBack} aria-label="Back" className={`${round} ${floating}`}>
          <CaretLeftIcon size={20} weight="bold" />
        </button>
        <p aria-hidden={!solid} className={`min-w-0 flex-1 truncate font-display text-lg font-medium transition-opacity duration-200 ${solid ? "opacity-100" : "opacity-0"}`}>
          {name}
        </p>
        <button type="button" onClick={share} aria-label={`Share ${name}`} className={`${round} ${floating}`}>
          <ShareNetworkIcon size={20} />
        </button>
        <button
          type="button"
          onClick={() => quote.open()}
          aria-label={`Open enquiry${quote.count ? `, ${quote.count} items` : ""}`}
          className={`${round} relative ${floating}`}
        >
          <BasketIcon size={20} />
          <AnimatePresence>
            {quote.count > 0 && (
              <motion.span
                key={quote.count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 16 }}
                className="absolute -top-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular"
              >
                {quote.count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
