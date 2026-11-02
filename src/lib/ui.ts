// Page container: wide and fluid, so large screens aren't left with empty side bands.
export const container = "mx-auto w-full max-w-[1800px] px-4 md:px-6 xl:px-10";

// Button recipes built only from theme tokens.
// Gotcha: never put `hidden` on the same element as button() — `inline-flex` wins.
// Wrap it instead: <div className="hidden md:block"><a className={button()} /></div>
const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-premium active:scale-[0.96]";

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  outline: "border border-border bg-surface text-foreground hover:border-foreground/40",
  "outline-inverse": "border border-inverse-foreground/25 text-inverse-foreground hover:bg-inverse-foreground/10",
  quiet: "bg-surface-muted text-foreground hover:bg-secondary",
};

export function button(variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md") {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}
