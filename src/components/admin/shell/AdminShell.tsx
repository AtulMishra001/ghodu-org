"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowSquareOutIcon, ListIcon, SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import SidebarNav, { SidebarNavFallback } from "./SidebarNav";

// Admin chrome. Desktop: a sidebar that collapses to an icon rail (remembered
// in localStorage). Phones: a top bar whose menu button slides the same
// sidebar in as a drawer.

const KEY = "ghodu-admin-sidebar";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

function useCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) === "collapsed",
    () => false,
  );
  const toggle = useCallback(() => {
    localStorage.setItem(KEY, collapsed ? "open" : "collapsed");
    listeners.forEach((l) => l());
  }, [collapsed]);
  return [collapsed, toggle] as const;
}

export default function AdminShell({ logo, mark, user, children }: { logo: ReactNode; mark: ReactNode; user: ReactNode; children: ReactNode }) {
  const [collapsed, toggle] = useCollapsed();
  const [drawer, setDrawer] = useState(false);

  // Close the drawer with Escape and keep the page from scrolling behind it.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const panel = (mode: "rail" | "drawer") => (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center gap-2 border-b px-3 ${collapsed && mode === "rail" ? "justify-center" : "justify-between"}`}>
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5 px-1 transition active:scale-95" onClick={() => setDrawer(false)}>
          {collapsed && mode === "rail" ? mark : logo}
        </Link>
        {mode === "drawer" ? (
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-control text-muted-foreground hover:bg-surface-muted">
            <XIcon size={20} />
          </button>
        ) : (
          !collapsed && <CollapseButton collapsed={collapsed} onClick={toggle} />
        )}
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <p className={`mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground ${collapsed && mode === "rail" ? "sr-only" : ""}`}>
          Manage
        </p>
        <Suspense fallback={<SidebarNavFallback compact={collapsed && mode === "rail"} />}>
          <SidebarNav compact={collapsed && mode === "rail"} onNavigate={() => setDrawer(false)} />
        </Suspense>
      </nav>

      <div className="flex flex-col gap-1 border-t p-3">
        {collapsed && mode === "rail" && (
          <div className="mb-1 flex justify-center">
            <CollapseButton collapsed={collapsed} onClick={toggle} />
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          title={collapsed && mode === "rail" ? "View website" : undefined}
          className={`flex h-10 items-center gap-3 rounded-control px-3 text-sm font-semibold text-muted-foreground transition hover:bg-surface-muted hover:text-foreground ${
            collapsed && mode === "rail" ? "justify-center px-0" : ""
          }`}
        >
          <ArrowSquareOutIcon size={20} className="shrink-0" />
          {!(collapsed && mode === "rail") && "View website"}
        </Link>
        <div data-compact={collapsed && mode === "rail"} className="group/user">
          {user}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface-muted/50 lg:flex">
      {/* desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="sticky top-0 hidden h-dvh shrink-0 overflow-hidden border-r bg-background lg:block"
      >
        {panel("rail")}
      </motion.aside>

      {/* phone top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/92 px-2 backdrop-blur-md lg:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} className="grid size-11 place-items-center rounded-control transition active:scale-90 active:bg-surface-muted">
          <ListIcon size={22} />
        </button>
        <Link href="/admin" className="flex items-center">
          {logo}
        </Link>
      </header>

      {/* phone drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-50 bg-inverse/40 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.4, right: 0 }}
              onDragEnd={(_, info) => (info.offset.x < -80 || info.velocity.x < -400) && setDrawer(false)}
              className="fixed inset-y-0 left-0 z-50 w-[min(300px,85vw)] bg-background shadow-float lg:hidden"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              {panel("drawer")}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        {/* desktop top bar */}
        <header className="sticky top-0 z-30 hidden h-[72px] items-center justify-between gap-4 border-b bg-background/92 px-6 backdrop-blur-md lg:flex xl:px-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Catalogue admin</p>
            <p className="font-display text-xl leading-tight font-medium">Ghodu Agro</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex h-10 items-center gap-2 rounded-control border bg-surface px-4 text-sm font-semibold transition hover:border-foreground/30 active:scale-95"
          >
            View site
            <ArrowSquareOutIcon size={16} />
          </Link>
        </header>
        <main className="px-4 pt-5 pb-10 md:px-6 md:pt-8 xl:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="grid size-9 shrink-0 place-items-center rounded-control text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
    >
      <SidebarSimpleIcon size={20} />
    </button>
  );
}

