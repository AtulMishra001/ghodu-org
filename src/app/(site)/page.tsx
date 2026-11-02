import EnquiryBand from "@/components/home/EnquiryBand";
import HarvestCalendar from "@/components/home/HarvestCalendar";
import HomeBento from "@/components/home/HomeBento";
import Hero from "@/components/home/Hero";
import OrderingSteps from "@/components/home/OrderingSteps";
import OriginStory from "@/components/home/OriginStory";
import ProduceMarquee from "@/components/home/ProduceMarquee";
import ProductShowcase from "@/components/home/ProductShowcase";
import FaqPhoto from "@/components/shared/FaqPhoto";
import FaqSection from "@/components/shared/FaqSection";
import { getHomeContent } from "@/data/home";

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <HomeBento hero={content.hero} products={content.products} origin={content.origin} steps={content.steps} faqs={content.faqs} />
      <div className="max-md:hidden">
      <Hero hero={content.hero} products={content.products} />
      <ProduceMarquee names={content.products.map((p) => p.name)} />
      <HarvestCalendar products={content.products} />
      <ProductShowcase products={content.products} categories={content.productCategories} />
      <OriginStory origin={content.origin} />
      <OrderingSteps steps={content.steps} image={content.stepsImage} />
      <FaqSection index="05" title="What buyers ask first" faqs={content.faqs} aside={<FaqPhoto photo={content.faqImage} />} />
      <EnquiryBand image={content.enquiryImage} />
      </div>
    </>
  );
}
