import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product } from "@/data/products";
import { seasonLabel } from "@/lib/season";

// The spec sheet: fixed facts first, then the specs entered in the admin.
export default function ProductSpecs({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ["Line", `${product.category} · ${product.kind}`],
    ["Origin", "Kashmir valley"],
    ["Harvest", seasonLabel(product.harvest)],
    ["Forms", product.forms.join(", ")],
    ...(product.specs ?? []).map((s) => [s.label, s.value] as [string, string]),
  ];

  return (
    <Section id="specifications">
      <SectionHeader index="02" kicker="Specifications" title="Product specifications" />
      <Reveal className="mt-5 overflow-hidden rounded-card border">
        {/* Each cell draws its own right and bottom edge; the negative margin hides the outer ones. */}
        <dl className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(([k, v]) => (
            <div key={k} className="border-r border-b px-4 py-3.5 md:px-5 md:py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-[15px] leading-snug font-semibold md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
