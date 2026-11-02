import { months } from "@/data/site";

// Twelve ticks, one per month; harvest months filled, the highlighted month ringed.
export default function MonthBar({ harvest, highlight }: { harvest: number[]; highlight?: number | null }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`Harvest: ${harvest.map((m) => months[m]).join(", ")}`}>
      {months.map((m, i) => (
        <span
          key={m}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            harvest.includes(i) ? "bg-primary" : "bg-border"
          } ${highlight === i ? "outline-2 outline-offset-1 outline-accent" : ""}`}
        />
      ))}
    </div>
  );
}
