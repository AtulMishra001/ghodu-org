import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product } from "@/data/products";
import { photoProps } from "@/lib/photo";
import { seasonLabel } from "@/lib/season";

// Other products to look at next; same line first.
export default function RelatedProducts({ products, line, index }: { products: Product[]; line: string; index: string }) {
  if (!products.length) return null;
  const title = products.every((p) => p.category === line) ? `More ${line.toLowerCase()}` : "You might also source";
  return (
    <Section id="more" className="max-md:border-t max-md:pt-3 max-md:pb-4">
      <div className="max-md:sr-only">
        <SectionHeader
          index={index}
          kicker="More from the valley"
          title={title}
          action={
            <Link href="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline md:flex">
              Full catalogue
              <ArrowRightIcon size={16} />
            </Link>
          }
        />
      </div>
      <p aria-hidden className="text-sm font-semibold md:hidden">{title}</p>
      <ul className="rail -mx-4 mt-2 scroll-pl-4 gap-2.5 px-4 md:mx-0 md:mt-5 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.slug} className="w-[38%] shrink-0 sm:w-[28%] md:w-auto">
            <Link href={`/products/${p.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-tile bg-inverse md:aspect-[4/5] md:rounded-card">
                <Image
                  {...photoProps(p.image)}
                  alt={p.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 38vw"
                  className="object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-inverse/90 via-inverse/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-inverse-foreground md:p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-inverse-foreground/70 max-md:hidden">{p.kind}</p>
                  <p className="font-display text-base leading-tight font-medium md:text-2xl">{p.name}</p>
                </div>
              </div>
              <p className="mt-2 flex items-center justify-between text-sm max-md:hidden">
                <span className="text-muted-foreground">Harvest {seasonLabel(p.harvest)}</span>
                <ArrowRightIcon size={16} className="text-primary transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
