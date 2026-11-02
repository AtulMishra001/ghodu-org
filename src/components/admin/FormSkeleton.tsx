// Placeholder while the product form streams in.
export default function FormSkeleton() {
  return (
    <div className="animate-pulse" aria-busy aria-label="Loading">
      <div className="h-4 w-24 rounded bg-border/50" />
      <div className="mt-3 h-10 w-64 rounded-control bg-border/60" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 rounded-card border bg-surface" />
          ))}
        </div>
        <div className="aspect-[4/5] rounded-card border bg-surface" />
      </div>
    </div>
  );
}
