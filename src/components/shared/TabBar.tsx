"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { BasketIcon, ChatCircleIcon, HouseIcon, PackageIcon, PlantIcon, type Icon } from "@phosphor-icons/react";
import { haptic } from "@/lib/haptics";
import { setNavDirection } from "@/lib/nav-direction";
import { isActivePath } from "./AppBar";
import { useQuote } from "./QuoteProvider";

const tabs: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/about-us", label: "About", icon: PlantIcon },
  { href: "/contact", label: "Contact", icon: ChatCircleIcon },
];

// Docked, edge-to-edge bar with a sliding indicator on the top edge and the
// enquiry basket in the middle. Hides while scrolling down, returns on scroll up.
export default function TabBar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const quote = useQuote();
  const current = tabs.findIndex((t) => isActivePath(pathname, t.href));

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 40;
    if (atBottom || y < prev - 6 || y < 120) setHidden(false);
    else if (y > prev + 6) setHidden(true);
  });

  const item = (tab: (typeof tabs)[number], index: number) => {
    const active = index === current;
    const TabIcon = tab.icon;
    return (
      <li key={tab.href} className="relative h-full">
        {active && (
          <motion.span
            layoutId="tab-indicator"
            className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-primary"
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
        <Link
          href={tab.href}
          aria-current={active ? "page" : undefined}
          onClick={() => {
            if (active) return;
            haptic(6);
            setNavDirection(index > current ? 1 : -1);
          }}
          className="flex h-full flex-col items-center justify-center gap-1"
        >
          <motion.span whileTap={{ scale: 0.82 }} transition={{ type: "spring", stiffness: 600, damping: 28 }}>
            <TabIcon size={24} weight={active ? "duotone" : "light"} className={active ? "text-primary" : "text-muted-foreground"} />
          </motion.span>
          <span className={`text-[11px] font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>{tab.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <motion.nav
      aria-label="Main"
      initial={false}
      animate={{ y: hidden ? "110%" : "0%" }}
      transition={{ type: "spring", stiffness: 420, damping: 40 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 shadow-float backdrop-blur-xl backdrop-saturate-150 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-(--tabbar-h) grid-cols-5 items-stretch">
        {tabs.slice(0, 2).map((t, i) => item(t, i))}
        <li className="flex items-center justify-center">
          <motion.button
            type="button"
            aria-label={`Open enquiry${quote.count ? `, ${quote.count} items` : ""}`}
            whileTap={{ scale: 0.88 }}
            onClick={() => quote.open()}
            className="relative -mt-5 grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-elevated ring-4 ring-background"
          >
            <BasketIcon size={26} weight="duotone" />
            <AnimatePresence>
              {quote.count > 0 && (
                <motion.span
                  key={quote.count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 16 }}
                  className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground tabular"
                >
                  {quote.count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </li>
        {tabs.slice(2).map((t, i) => item(t, i + 2))}
      </ul>
    </motion.nav>
  );
}
