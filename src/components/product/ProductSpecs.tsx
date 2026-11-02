import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product } from "@/data/products";
import { seasonLabel } from "@/lib/season";

// The spec sheet: fixed facts first, then the specs entered in the admin.
// Two columns on phones, with long values taking a full row.
export default function ProductSpecs({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ["Line", `${product.category} · ${product.kind}`],
    ["Origin", "Kashmir valley"],
    ["Harvest", seasonLabel(product.harvest)],
    ["Forms", product.forms.join(", ")],
    ...(product.specs ?? []).map((s) => [s.label, s.value] as [string, string]),
  ];

  return (
    <Section id="specifications" className="max-md:pt-3 max-md:pb-4">
      <div className="max-md:sr-only">
        <SectionHeader index="02" kicker="Specifications" title="Product specifications" />
      </div>
      <Reveal className="overflow-hidden rounded-card border md:mt-5">
        {/* Each cell draws its own right and bottom edge; the negative margin hides the outer ones. */}
        <dl className="-mr-px -mb-px grid grid-flow-dense grid-cols-2 xl:grid-cols-3">
          {rows.map(([k, v]) => (
            <div key={k} className={`border-r border-b px-3 py-2.5 md:px-5 md:py-4 ${v.length > 22 ? "max-md:col-span-2" : ""}`}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground md:text-xs md:tracking-[0.12em]">{k}</dt>
              <dd className="mt-0.5 text-sm leading-snug font-semibold md:mt-1 md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
