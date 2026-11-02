"use client";

import { useSyncExternalStore } from "react";

// Current month (0 = Jan) on the client, null during server render, so no date
// is baked into prerendered HTML (cacheComponents fails builds on `new Date()`).
export function useMonth() {
  return useSyncExternalStore(
    () => () => {},
    () => new Date().getMonth(),
    () => null,
  );
}
