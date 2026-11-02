// The FAQ shape shared by blog posts, products and the static page lists.
export type Faq = { question: string; answer: string };

/** Static lists can point the reader somewhere next; CMS FAQs are plain text. */
export type PageFaq = Faq & { link?: { href: string; label: string } };

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
}
