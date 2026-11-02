import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import FaqSection from "@/components/shared/FaqSection";
import type { Product } from "@/data/products";

// Written per product in the admin; products without FAQs skip the section.
export default function ProductFaq({ product }: { product: Product }) {
  return (
    <FaqSection
      key={product.slug}
      index="05"
      title={`Questions about ${product.name.toLowerCase()}`}
      faqs={product.faqs ?? []}
      aside={
        <Link href="#details" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Ask something else in the enquiry form
          <ArrowRightIcon size={14} weight="bold" />
        </Link>
      }
    />
  );
}
