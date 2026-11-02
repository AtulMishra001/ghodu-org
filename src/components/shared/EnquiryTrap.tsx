"use client";

import { useCallback, useEffect, useRef } from "react";

/** How long this form has been on screen, in ms. Sent as a duration so a wrong device clock can't matter. */
export function useFillTimer() {
  const started = useRef(0);
  useEffect(() => {
    started.current = performance.now();
  }, []);
  return useCallback(() => Math.round(performance.now() - started.current), []);
}

// Bot protection for enquiry forms: hidden from people, so anything typed here
// means the sender isn't one.
export default function EnquiryTrap() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
