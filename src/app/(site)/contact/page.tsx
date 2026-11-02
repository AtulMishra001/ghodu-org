import type { Metadata } from "next";
import BuyerGuide from "@/components/contact/BuyerGuide";
import ContactChannels from "@/components/contact/ContactChannels";
import ContactDesk from "@/components/contact/ContactDesk";
import ContactFlow from "@/components/contact/ContactFlow";
import ContactProvider from "@/components/contact/ContactProvider";
import NextSteps from "@/components/contact/NextSteps";
import SeasonWatch from "@/components/contact/SeasonWatch";
import FaqSection from "@/components/shared/FaqSection";
import { getContactContent } from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send Ghodu Agro a bulk order, sample or season supply enquiry for agricultural produce from the Kashmir valley.",
};

export default async function ContactPage() {
  const content = await getContactContent();

  return (
    <ContactProvider intents={content.intents} products={content.products}>
      <ContactFlow
        intro={content.intro}
        intents={content.intents}
        channels={content.channels}
        season={content.season}
        buyers={content.buyers}
        steps={content.steps}
        faqs={content.faqs}
      />
      <div className="max-md:hidden">
      <ContactDesk intro={content.intro} intents={content.intents} />
      <ContactChannels channels={content.channels} />
      <SeasonWatch season={content.season} />
      <BuyerGuide buyers={content.buyers} />
      <NextSteps steps={content.steps} />
      <FaqSection index="04" title="Before you write" faqs={content.faqs} className="pb-8 md:pb-10" />
      </div>
    </ContactProvider>
  );
}
