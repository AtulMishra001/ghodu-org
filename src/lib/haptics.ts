// A short buzz on Android, the closest the web gets to native tap feedback.
// iOS Safari has no vibration API, so this is silently a no-op there.
// Keep durations tiny (3–12 ms): it should feel like a click, not a phone call.
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}
