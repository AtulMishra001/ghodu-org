"use client";

import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { useMediaQuery } from "@/lib/use-media-query";

// Bottom sheet on phones (drag the handle down to dismiss), centred dialog on
// desktop. Use it for anything that would otherwise be a new page of text:
// details, forms, filters, "read more".
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <SheetPanel key="sheet" onClose={onClose} title={title} description={description}>
          {children}
        </SheetPanel>
      )}
    </AnimatePresence>
  );
}

function SheetPanel({
  onClose,
  title,
  description,
  children,
}: {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const dragControls = useDragControls();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves in when it opens and returns to whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  // Tab stays inside the sheet while it's open.
  function trapTab(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  }

  const panelMotion = isDesktop
    ? {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.97 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring" as const, stiffness: 400, damping: 40 },
      };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-inverse/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapTab}
        {...panelMotion}
        drag={isDesktop ? false : "y"}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
        className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-card bg-background outline-none md:max-w-[440px] md:rounded-card md:shadow-elevated"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div
          className="sticky top-0 z-10 touch-none bg-background/95 px-5 pt-2.5 backdrop-blur md:pt-5"
          onPointerDown={(e) => !isDesktop && dragControls.start(e)}
        >
          <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-border md:hidden" />
          <div className="flex items-start justify-between gap-4 pb-3">
            <div>
              <h2 id={titleId} className="font-display text-[26px] font-medium leading-tight">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-muted-foreground transition active:scale-90"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </div>
        </div>
        <div className="px-5 pt-2">{children}</div>
      </motion.div>
    </div>
  );
}
