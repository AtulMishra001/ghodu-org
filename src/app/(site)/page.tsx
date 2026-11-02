import EnquiryBand from "@/components/home/EnquiryBand";
import HarvestCalendar from "@/components/home/HarvestCalendar";
import Hero from "@/components/home/Hero";
import OrderingSteps from "@/components/home/OrderingSteps";
import OriginStory from "@/components/home/OriginStory";
import ProduceMarquee from "@/components/home/ProduceMarquee";
import ProductShowcase from "@/components/home/ProductShowcase";
import QuickActions from "@/components/home/QuickActions";
import FaqPhoto from "@/components/shared/FaqPhoto";
import FaqSection from "@/components/shared/FaqSection";
import { getHomeContent } from "@/data/home";

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <Hero hero={content.hero} products={content.products} />
      <QuickActions />
      <ProduceMarquee names={content.products.map((p) => p.name)} />
      <HarvestCalendar products={content.products} />
      <ProductShowcase products={content.products} categories={content.productCategories} />
      <OriginStory origin={content.origin} />
      <OrderingSteps steps={content.steps} image={content.stepsImage} />
      <FaqSection index="05" title="What buyers ask first" faqs={content.faqs} aside={<FaqPhoto photo={content.faqImage} />} />
      <EnquiryBand image={content.enquiryImage} />
    </>
  );
}
