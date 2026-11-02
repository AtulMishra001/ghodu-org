import type { ReactNode } from "react";
import { faqPageSchema, type PageFaq } from "@/lib/faq";
import FaqAccordion from "./FaqAccordion";
import JsonLd from "./JsonLd";
import Section from "./Section";
import SectionHeader from "./SectionHeader";

// A page's FAQs and their structured data. `aside` sits under the heading, so
// each page can close the column with its own photo or next step.
export default function FaqSection({
  index,
  kicker = "Common questions",
  title,
  summary,
  faqs,
  aside,
  id = "questions",
  className,
  headerClassName,
}: {
  index: string;
  kicker?: string;
  title: string;
  summary?: string;
  faqs: PageFaq[];
  aside?: ReactNode;
  id?: string;
  className?: string;
  headerClassName?: string;
}) {
  if (!faqs.length) return null;
  return (
    <Section id={id} className={`scroll-mt-16 md:scroll-mt-20 ${className ?? ""}`}>
      <JsonLd data={faqPageSchema(faqs)} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className={headerClassName}>
            <SectionHeader index={index} kicker={kicker} title={title} summary={summary} />
          </div>
          {aside}
        </div>
        <FaqAccordion faqs={faqs} />
      </div>
    </Section>
  );
}
