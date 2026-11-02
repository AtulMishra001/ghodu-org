import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import FaqSection from "@/components/shared/FaqSection";
import type { Product } from "@/data/products";
import { AskButton } from "./ProductDock";

// Written per product in the admin; products without FAQs skip the section.
export default function ProductFaq({ product }: { product: Product }) {
  if (!product.faqs?.length) return null;
  return (
    <>
    <FaqSection
      key={product.slug}
      index="05"
      title={`Questions about ${product.name.toLowerCase()}`}
      faqs={product.faqs}
      className="max-md:pt-0"
      headerClassName="max-md:sr-only"
      aside={
        <div className="max-md:hidden">
          <Link href="#details" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Ask something else in the enquiry form
            <ArrowRightIcon size={14} weight="bold" />
          </Link>
        </div>
      }
    />
    <div className="px-4 pb-4 md:hidden">
      <AskButton slug={product.slug} />
    </div>
    </>
  );
}
