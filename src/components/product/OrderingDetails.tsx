import type { Icon } from "@phosphor-icons/react";
import { ClockIcon, CreditCardIcon, PackageIcon, ScalesIcon, TestTubeIcon, TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import { availabilityLabels, formatLeadTime, formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";

const ON_REQUEST = "On request";

// Everything a buyer needs before ordering. Blank fields read "On request",
// so the picture is always complete.
export default function OrderingDetails({ product }: { product: Product }) {
  const o = product.ordering;
  const cards: { icon: Icon; label: string; value: string; note?: string }[] = [
    {
      icon: ScalesIcon,
      label: "Minimum order",
      value: o?.moq ? formatQuantity(o.moq) : ON_REQUEST,
      note: o ? availabilityLabels[o.availability] : undefined,
    },
    { icon: ClockIcon, label: "Dispatch time", value: o?.leadTimeDays ? formatLeadTime(o.leadTimeDays) : ON_REQUEST, note: "After the order is confirmed" },
    {
      icon: TestTubeIcon,
      label: "Samples",
      value: o?.samples ? (o.samples.available ? "Available" : "Not available") : ON_REQUEST,
      note: o?.samples?.available ? o.samples.note : undefined,
    },
    { icon: CreditCardIcon, label: "Payment terms", value: o?.paymentTerms || ON_REQUEST },
    { icon: TruckIcon, label: "Delivers to", value: o?.deliveryRegions.length ? o.deliveryRegions.join(", ") : ON_REQUEST },
  ];

  return (
    <Section id="ordering" className="max-md:pt-3 max-md:pb-4">
      <div className="max-md:sr-only">
        <SectionHeader
          index="03"
          kicker="How to order"
          title="Ordering terms"
          summary="Terms are confirmed in writing before anything is dispatched."
        />
      </div>

      <div className="grid gap-3 md:mt-5 md:gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Hairline cells on phones, like the spec sheet; separate cards from md up. */}
        <div className="overflow-hidden rounded-card border md:overflow-visible md:rounded-none md:border-0">
        <div className="-mr-px -mb-px grid grid-cols-2 md:m-0 md:gap-3">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.04} className={i === cards.length - 1 && cards.length % 2 ? "col-span-2" : ""}>
              <div className="flex h-full gap-3.5 border-r border-b px-3 py-2.5 md:rounded-card md:border md:bg-surface md:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-primary/8 text-primary max-md:hidden">
                  <c.icon size={22} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground md:text-sm">{c.label}</p>
                  <p className={`text-sm leading-snug font-semibold md:text-lg ${c.value === ON_REQUEST ? "font-normal text-muted-foreground" : ""}`}>{c.value}</p>
                  {c.note && <p className="text-xs text-muted-foreground md:mt-0.5 md:text-sm">{c.note}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        </div>

        <Reveal delay={0.1} className="flex flex-col gap-3">
          <div className="rounded-card border bg-surface px-3 py-2.5 md:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <PackageIcon size={20} className="text-primary" />
              Packing options
            </p>
            {o?.packaging.length ? (
              <ul className="mt-1 divide-y md:mt-3">
                {o.packaging.map((p) => (
                  <li key={p.label} className="flex items-center justify-between gap-3 py-2 text-sm md:py-2.5 md:text-[15px]">
                    <span>{p.label}</span>
                    <span className="shrink-0 font-semibold tabular">{formatQuantity(p.size)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[15px] text-muted-foreground">Agreed with you when you order.</p>
            )}
          </div>
          {o?.notes && (
            <div className="rounded-card bg-inverse px-3 py-2.5 text-inverse-foreground md:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Good to know</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-inverse-foreground/85 md:mt-2 md:text-[15px]">{o.notes}</p>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
