"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";

export type ToastTone = "success" | "error";

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** const toast = useToast(); toast("Email copied"); toast("Couldn't save", "error") */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    // Errors stay up longer: they usually need reading, not just noticing.
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 5000 : 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-4 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+0.75rem+var(--toast-lift,0px))] md:bottom-[calc(2rem+var(--toast-lift,0px))]"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className="flex items-center gap-2 rounded-control bg-inverse py-2.5 pr-5 pl-3 text-sm font-semibold text-inverse-foreground shadow-float"
            >
              {toast.tone === "error" ? (
                <WarningCircleIcon size={20} weight="fill" className="shrink-0 text-red-300" />
              ) : (
                <CheckCircleIcon size={20} weight="fill" className="shrink-0 text-accent" />
              )}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
