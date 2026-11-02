"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { isActive, navItems, type NavItem } from "./nav";

// Reads the URL for the active tab, so it renders inside Suspense.
export default function SidebarNav({ compact, onNavigate }: { compact: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  return <Items compact={compact} active={(href) => isActive(pathname, href)} onNavigate={onNavigate} />;
}

export function SidebarNavFallback({ compact }: { compact: boolean }) {
  return <Items compact={compact} active={() => false} />;
}

function Items({ compact, active, onNavigate }: { compact: boolean; active: (href: string) => boolean; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => (
        <li key={item.href}>
          <Item item={item} compact={compact} active={active(item.href)} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}

function Item({ item, compact, active, onNavigate }: { item: NavItem; compact: boolean; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  const body = (
    <>
      {active && (
        <motion.span
          layoutId="admin-nav-active"
          className="absolute inset-0 rounded-control bg-primary/10"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
      <Icon size={22} weight={active ? "fill" : "regular"} className="relative shrink-0" />
      {!compact && <span className="relative flex-1 truncate">{item.label}</span>}
      {!compact && item.soon && (
        <span className="relative rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
          Soon
        </span>
      )}
    </>
  );
  const cls = `group relative flex h-11 items-center gap-3 rounded-control text-[15px] font-semibold transition-colors ${
    compact ? "justify-center" : "px-3"
  } ${active ? "text-primary" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"}`;

  if (item.soon)
    return (
      <span aria-disabled className={`${cls} cursor-not-allowed opacity-60 hover:bg-transparent hover:text-muted-foreground`} title={`${item.label} — coming soon`}>
        {body}
      </span>
    );

  return (
    <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={compact ? item.label : undefined} className={cls}>
      {body}
    </Link>
  );
}
