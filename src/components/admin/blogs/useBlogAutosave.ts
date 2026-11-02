"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "ghodu_agro_blog";

export type SavedCopy<F> = { form: F; savedAt: string };

function read<F>(key: string): SavedCopy<F> | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedCopy<F>) : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the form in localStorage, with one key for "create" and one per edited
 * post. Nothing is written until the user changes something. After a successful
 * save the key is cleared and writes stop, because late editor updates would
 * otherwise re-save the post and prefill the next new one.
 *
 * localStorage is only read after mount, so the server-rendered form always
 * matches the first browser render.
 */
export function useBlogAutosave<F>({ id, form, initial, onRestore }: { id?: string; form: F; initial: F; onRestore: (form: F) => void }) {
  const key = id ? `${PREFIX}_edit_${id}_v1` : `${PREFIX}_draft_v1`;
  const dirty = useRef(false);
  const closed = useRef(false);
  /** A saved copy waiting for the user's decision (edit form only). */
  const [pending, setPending] = useState<SavedCopy<F> | null>(null);
  /** The create form brought back a draft, which the user may want to discard. */
  const [restoredAt, setRestoredAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = read<F>(key);
    if (!saved?.form) return;
    if (JSON.stringify(saved.form) === JSON.stringify(initial)) {
      window.localStorage.removeItem(key);
      return;
    }
    // Deliberately in an effect: localStorage doesn't exist during server render.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (id) {
      setPending(saved);
    } else {
      onRestore(saved.form);
      setRestoredAt(saved.savedAt);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // Only ever runs once per form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!dirty.current || closed.current || pending) return;
    try {
      const copy: SavedCopy<F> = { form, savedAt: new Date().toISOString() };
      window.localStorage.setItem(key, JSON.stringify(copy));
    } catch {
      // Storage full or blocked: the form still works, just without the safety net.
    }
  }, [form, key, pending]);

  return {
    pending,
    restoredAt,
    /** Call from every user edit, before the state changes. */
    markDirty: useCallback(() => {
      dirty.current = true;
    }, []),
    restorePending: () => {
      if (!pending) return;
      onRestore(pending.form);
      setPending(null);
    },
    /** Throws away the saved copy and goes back to the starting form. */
    discard: () => {
      window.localStorage.removeItem(key);
      dirty.current = false;
      setPending(null);
      setRestoredAt(null);
      onRestore(initial);
    },
    /** After a successful save. */
    close: () => {
      closed.current = true;
      dirty.current = false;
      window.localStorage.removeItem(key);
    },
    /** Ready for a fresh start when the router shows this form again. */
    reopen: () => {
      closed.current = false;
      dirty.current = false;
      setRestoredAt(null);
    },
    isClosed: () => closed.current,
  };
}
