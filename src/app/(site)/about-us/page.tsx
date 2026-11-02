import type { Metadata } from "next";
import AboutClosing from "@/components/about-us/AboutClosing";
import AboutHero from "@/components/about-us/AboutHero";
import FounderNote from "@/components/about-us/FounderNote";
import JourneyPanels from "@/components/about-us/JourneyPanels";
import NumbersBand from "@/components/about-us/NumbersBand";
import StandardsList from "@/components/about-us/StandardsList";
import StoryChapters from "@/components/about-us/StoryChapters";
import FaqPhoto from "@/components/shared/FaqPhoto";
import FaqSection from "@/components/shared/FaqSection";
import { getAboutContent } from "@/data/about";

export const metadata: Metadata = {
  title: "About us",
  description: "The story of Ghodu Agro: how we source, grade and ship agricultural produce from the Kashmir valley to businesses.",
};

export default async function AboutUsPage() {
  const content = await getAboutContent();

  return (
    <>
      <AboutHero hero={content.hero} />
      <StoryChapters story={content.story} />
      <FounderNote note={content.note} />
      <JourneyPanels journey={content.journey} />
      <StandardsList standards={content.standards} />
      <NumbersBand numbers={content.numbers} />
      <FaqSection index="06" title="Getting to know us" faqs={content.faqs} aside={<FaqPhoto photo={content.faqImage} />} />
      <AboutClosing closing={content.closing} />
    </>
  );
}
