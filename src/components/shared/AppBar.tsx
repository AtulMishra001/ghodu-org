"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { BasketIcon, CaretLeftIcon, ChatCircleIcon } from "@phosphor-icons/react";
import { nav } from "@/data/site";
import { haptic } from "@/lib/haptics";
import { setNavDirection } from "@/lib/nav-direction";
import { button } from "@/lib/ui";
import { useQuote } from "./QuoteProvider";

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function parentPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : "/";
}

export default function AppBar({ logo }: { logo: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const quote = useQuote();
  const isRoot = nav.some((item) => item.href === pathname);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 4));

  function goBack() {
    haptic(5);
    setNavDirection(-1);
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back();
    else router.push(parentPath(pathname));
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${
        scrolled ? "border-b bg-background/85 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-background"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1800px] px-4 md:px-6 xl:px-10 items-center gap-4 md:h-[72px]">
        <div className="flex min-w-0 flex-1 items-center md:flex-none">
          {!isRoot && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Back"
              className="-ml-2 mr-1 grid size-10 shrink-0 place-items-center rounded-full transition active:scale-90 active:bg-surface-muted md:hidden"
            >
              <CaretLeftIcon size={22} weight="bold" />
            </button>
          )}
          <Link href="/" aria-label="Ghodu Agro home" className="transition active:scale-95">
            {logo}
          </Link>
        </div>

        <DesktopNav pathname={pathname} />

        <div className="flex items-center gap-2 md:ml-auto">
          <Link
            href="/contact"
            aria-label="Contact us"
            className="grid size-10 place-items-center rounded-full border bg-surface transition active:scale-90 md:hidden"
          >
            <ChatCircleIcon size={20} />
          </Link>
          <div className="hidden md:block">
            <button type="button" onClick={() => quote.open()} className={button("primary", "md")}>
              <BasketIcon size={20} />
              Request a quote
              {quote.count > 0 && (
                <motion.span
                  key={quote.count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground tabular"
                >
                  {quote.count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Desktop links: a hover pill glides between them, a mustard bar marks the current page. */
function DesktopNav({ pathname }: { pathname: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <nav aria-label="Main" className="mx-auto hidden md:block" onMouseLeave={() => setHovered(null)}>
      <ul className="flex items-center gap-1">
        {nav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => setHovered(item.href)}
                className={`relative block px-4 py-2.5 text-[15px] font-semibold transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {hovered === item.href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-control bg-surface-muted"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
