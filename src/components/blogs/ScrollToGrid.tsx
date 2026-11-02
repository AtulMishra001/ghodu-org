"use client";

import { useEffect, useRef } from "react";

// Brings the grid into view after a pagination link (#posts). The browser can't
// be left to do it: the router keeps visited pages in the DOM but hidden, so the
// first #posts it finds may be one that can't be scrolled to.
export default function ScrollToGrid() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.location.hash === "#posts") ref.current?.closest("section")?.scrollIntoView();
  }, []);
  return <span ref={ref} hidden />;
}
