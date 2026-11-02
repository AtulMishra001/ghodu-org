import type { PageFaq } from "@/lib/faq";
import { photos } from "./photos";
import { getProducts } from "./catalogue";
import { productCategories } from "./products";

// The home page loads everything through this function, so it can later be
// swapped for a CMS or database call without touching the components.
export async function getHomeContent() {
  const products = await getProducts();

  return {
    hero: {
      eyebrow: "B2B supply · Kashmir valley",
      titleStart: "Kashmir's finest produce,",
      titleAccent: "delivered",
      titleEnd: "for your business.",
      summary:
        "We source saffron, walnuts, almonds and orchard fruit across the valley and supply them in bulk to traders, brands and food businesses.",
      // What the ordering process already promises (see `steps`) — no invented stats.
      capabilities: [
        { icon: "volume", title: "Bulk volumes", body: "Order by the kilo or the tonne" },
        { icon: "spec", title: "Your specification", body: "Grade and packing agreed upfront" },
        { icon: "season", title: "Season-planned", body: "Buy in step with the harvest" },
      ] as const,
    },
    products,
    productCategories,
    // General facts about the region, not claims about Ghodu Agro.
    // TODO: re-check the figures before launch.
    origin: {
      title: "Why Kashmir",
      summary:
        "A high valley ringed by the Himalaya and Pir Panjal, with cold winters, long summer days and mineral-rich soil.",
      facts: [
        { value: 1585, suffix: " m", label: "Srinagar's altitude above sea level" },
        { value: 75, suffix: "%", label: "Approximate share of India's apples grown in J&K" },
        { value: 90, suffix: "%", label: "Approximate share of India's walnuts grown in J&K" },
      ],
      note: "Kashmir saffron carries a Geographical Indication (GI) tag, granted in 2020.",
      image: photos.saffronField,
    },
    stepsImage: photos.orchard,
    enquiryImage: photos.valley,
    steps: [
      { title: "Tell us what you need", body: "Products, quantity, form and where it ships." },
      { title: "We confirm the details", body: "Grade, packing, price and timing — agreed before anything moves." },
      { title: "Order and dispatch", body: "Your order is packed and sent on the agreed schedule." },
    ],
    faqImage: photos.walnuts,
    // Restates what the page already promises; no terms beyond it.
    faqs: [
      {
        question: "What does Ghodu Agro supply?",
        answer: "Agricultural produce from the Kashmir valley, in bulk: dry fruits such as walnuts and almonds, and crops such as saffron, Kashmiri chilli and orchard fruit.",
        link: { href: "/products", label: "Browse products" },
      },
      {
        question: "Who do you supply?",
        answer: "Businesses, including traders, brands and food businesses.",
      },
      {
        question: "How do I place an order?",
        answer: "Send an enquiry with the products, quantity, form and where it ships. We confirm the grade, packing, price and timing with you before anything moves, then pack and send the order on the agreed schedule.",
        link: { href: "/contact", label: "Send an enquiry" },
      },
      {
        question: "What quantities can I order?",
        answer: "You can order by the kilo or the tonne. Where a product has a minimum order, it's shown on that product's page.",
      },
      {
        question: "When can I buy each crop?",
        answer: "Each crop comes in at its own time of year, so buying is planned around the harvest. The calendar on this page shows what's in season, month by month.",
        link: { href: "#harvest", label: "See the harvest calendar" },
      },
    ] satisfies PageFaq[],
  };
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
