// Placeholder while an admin page streams in.
export default function PanelSkeleton() {
  return (
    <div className="animate-pulse" aria-busy aria-label="Loading">
      <div className="h-9 w-48 rounded-control bg-border/60" />
      <div className="mt-2 h-4 w-72 rounded bg-border/50" />
      <div className="mt-6 overflow-hidden rounded-card border bg-surface">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0">
            <div className="size-14 rounded-tile bg-border/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-border/60" />
              <div className="h-3 w-24 rounded bg-border/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
