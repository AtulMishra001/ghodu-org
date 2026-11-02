import type { ReactNode } from "react";

// "01 / Harvest calendar" — kicker number, title, optional summary and trailing action.
export default function SectionHeader({
  index,
  kicker,
  title,
  summary,
  action,
  inverse,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  summary?: string;
  action?: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p
          className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
            inverse ? "text-accent" : "text-primary"
          }`}
        >
          <span className="tabular">{index}</span>
          <span className={`h-px w-6 ${inverse ? "bg-accent/60" : "bg-primary/40"}`} />
          {kicker}
        </p>
        <h2 className="mt-2 font-display text-[28px] leading-[1.1] font-medium tracking-tight md:text-[40px]">
          {title}
        </h2>
        {summary && (
          <p className={`mt-2 text-[15px] md:text-base ${inverse ? "text-inverse-foreground/75" : "text-muted-foreground"}`}>
            {summary}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
