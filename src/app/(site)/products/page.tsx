import type { Metadata } from "next";
import CatalogueHelp from "@/components/products/CatalogueHelp";
import CatalogueHeader from "@/components/products/CatalogueHeader";
import CatalogueProvider from "@/components/products/CatalogueProvider";
import CatalogueResults from "@/components/products/CatalogueResults";
import CatalogueToolbar from "@/components/products/CatalogueToolbar";
import EnquiryTray from "@/components/products/EnquiryTray";
import SourcingPanel from "@/components/products/SourcingPanel";
import FaqSection from "@/components/shared/FaqSection";
import { getCatalogue } from "@/data/catalogue";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Dry fruits and crops from the Kashmir valley — walnuts, almonds, saffron, Kashmiri chilli and orchard fruit — supplied in bulk to businesses.",
};

export default async function ProductsPage() {
  const catalogue = await getCatalogue();

  return (
    <CatalogueProvider products={catalogue.products}>
      <CatalogueHeader intro={catalogue.intro} categories={catalogue.categories} />
      <section id="catalogue" aria-label="Product catalogue" className="scroll-mt-14 pt-3 md:scroll-mt-[72px] md:pt-8">
        <CatalogueToolbar categories={catalogue.categories.map((c) => c.name)} />
        <CatalogueResults />
      </section>
      <CatalogueHelp faqs={catalogue.faqs} sourcing={catalogue.sourcing} />
      <div className="max-md:hidden">
        <FaqSection index="01" title="Before you enquire" faqs={catalogue.faqs} />
        <SourcingPanel sourcing={catalogue.sourcing} />
      </div>
      <EnquiryTray />
    </CatalogueProvider>
  );
}
