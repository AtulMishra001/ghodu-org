import type { ReactNode } from "react";
import { container } from "@/lib/ui";

// One vertical rhythm for every section: never more than 2.5rem (p-10) between blocks.
export default function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${container} pt-8 md:pt-10 ${className ?? ""}`}>
      {children}
    </section>
  );
}
