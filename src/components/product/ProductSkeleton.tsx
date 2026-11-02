import { container } from "@/lib/ui";

// Placeholder for the product page while it streams in (e.g. right after an
// admin save refreshes it). Same layout as the hero, so nothing jumps.
export default function ProductSkeleton() {
  return (
    <section data-immersive className={`${container} animate-pulse md:pt-4`} aria-busy aria-label="Loading product">
      <div className="mb-2.5 hidden h-4 w-48 rounded bg-surface-muted md:block" />
      <div className="grid gap-4 max-md:gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        <div className="-mx-4 h-[clamp(8.5rem,calc(100svh-28.5rem-env(safe-area-inset-bottom)),40svh)] bg-surface-muted md:mx-0 md:aspect-4/3 md:h-auto md:rounded-card lg:aspect-auto lg:h-[clamp(360px,calc(100dvh-15rem),600px)]" />
        <div className="flex flex-col gap-3 lg:justify-center">
          <div className="h-3 w-32 rounded bg-surface-muted" />
          <div className="h-11 w-64 rounded bg-surface-muted" />
          <div className="h-8 w-56 rounded-full bg-surface-muted" />
          <div className="h-12 w-full max-w-xl rounded bg-surface-muted" />
          <div className="h-32 w-full rounded-card bg-surface-muted" />
          <div className="h-11 w-56 rounded-control bg-surface-muted" />
        </div>
      </div>
    </section>
  );
}
