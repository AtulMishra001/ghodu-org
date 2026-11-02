"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BasketIcon, CalendarBlankIcon, ChatCircleIcon, PackageIcon, type Icon } from "@phosphor-icons/react";
import { useQuote } from "@/components/shared/QuoteProvider";
import { haptic } from "@/lib/haptics";

// Phone only: the four jobs a buyer comes to do, one tap each.
export default function QuickActions() {
  const quote = useQuote();
  const actions: { label: string; icon: Icon; href?: string; onClick?: () => void }[] = [
    { label: "Catalogue", icon: PackageIcon, href: "/products" },
    { label: "Enquire", icon: BasketIcon, onClick: () => quote.open() },
    { label: "Seasons", icon: CalendarBlankIcon, href: "#harvest" },
    { label: "Contact", icon: ChatCircleIcon, href: "/contact" },
  ];

  return (
    <nav aria-label="Quick actions" className="mx-auto w-full px-4 pt-5 md:hidden">
      <ul className="grid grid-cols-4 gap-2">
        {actions.map((a, i) => {
          const inner = (
            <>
              <span className="grid size-11 place-items-center rounded-tile bg-surface-muted text-primary">
                <a.icon size={24} weight="duotone" />
              </span>
              <span className="text-xs font-semibold">{a.label}</span>
            </>
          );
          const cls = "flex w-full flex-col items-center gap-1.5 py-1";
          return (
            <motion.li
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.92 }}
            >
              {a.href ? (
                <Link href={a.href} onClick={() => haptic(5)} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={a.onClick} className={cls}>
                  {inner}
                </button>
              )}
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
