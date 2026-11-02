import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Product } from "@/data/products";
import { photoProps } from "@/lib/photo";
import { htmlToText, withHeadingIds } from "@/lib/rich-text";
import DescriptionPanel from "./DescriptionPanel";
import ProductEnquiryForm from "./ProductEnquiryForm";

// The full description from the admin editor in a scrolling card, beside an
// enquiry form. On desktop the form sets the row's height and the card matches it.
// On phones the form is the enquiry sheet, opened from the bottom dock.
export default function ProductDetails({ product }: { product: Product }) {
  // Already sanitised by the data layer (lib/server/sanitize.ts); this only adds heading ids.
  const { html, outline } = withHeadingIds(product.description ?? "");
  // A short description can't fill the card, so a photo takes up the rest of it.
  const photo = htmlToText(html).length < 500 && !html.includes("<img") ? (product.gallery?.at(-1) ?? product.image) : null;

  return (
    <Section id="details" className="max-md:p-0!">
      <div className="max-md:sr-only">
        <SectionHeader index="01" kicker="Details" title={`About our ${product.name.toLowerCase()}`} />
      </div>
      <div className="grid gap-3 md:mt-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-5">
        <Reveal className="min-w-0 lg:relative">
          <DescriptionPanel key={product.slug} label={`About ${product.name}`} outline={outline.length >= 2 ? outline : []}>
            <div className="flex min-h-full flex-col gap-4 md:gap-5">
              {html ? (
                <article className="product-description text-[15px] md:text-base" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p className="text-[15px] leading-relaxed md:text-base">{product.summary}</p>
              )}
              {photo && (
                <div className="relative min-h-48 flex-1 overflow-hidden rounded-tile bg-surface-muted max-md:hidden">
                  <Image {...photoProps(photo)} alt={photo.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                </div>
              )}
            </div>
          </DescriptionPanel>
        </Reveal>
        <Reveal delay={0.1} className="hidden min-w-0 md:block">
          <ProductEnquiryForm key={product.slug} product={product} />
        </Reveal>
      </div>
    </Section>
  );
}
