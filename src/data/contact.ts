import { getProducts } from "./catalogue";
import { photos } from "./photos";
import { site } from "./site";

export type ContactChannel = { kind: "whatsapp" | "phone" | "email" | "address"; label: string; value: string; href?: string };

// The contact page loads everything through this function, so it can later be
// swapped for a CMS or database call without touching the components.
export async function getContactContent() {
  const products = await getProducts();

  // Only details that really exist in site.ts are shown. TODO: fill those in;
  // this section of the page stays hidden until at least one is set.
  const channels: ContactChannel[] = [
    site.whatsapp && { kind: "whatsapp" as const, label: "WhatsApp", value: `+${site.whatsapp}`, href: `https://wa.me/${site.whatsapp}` },
    site.phone && { kind: "phone" as const, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    site.email && { kind: "email" as const, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { kind: "address" as const, label: "Address", value: site.address },
  ].filter((c) => !!c);

  return {
    intro: {
      eyebrow: "Contact",
      titleStart: "Tell us what your",
      titleAccent: "business",
      titleEnd: "needs.",
      summary: "Choose what you're after and fill in what you know. You'll see the message as you write it.",
    },
    products,
    intents: [
      {
        id: "order" as const,
        label: "Bulk order",
        blurb: "Price and packing for a quantity",
        subject: "Bulk enquiry",
        image: photos.orchard,
        withProducts: true,
        withQuantity: true,
        withDelivery: true,
        notesLabel: "Notes",
        notesHint: "Grade, packing, timeline…",
      },
      {
        id: "sample" as const,
        label: "Samples",
        blurb: "Check the quality first",
        subject: "Sample request",
        image: photos.almonds,
        withProducts: true,
        withQuantity: false,
        withDelivery: true,
        notesLabel: "Notes",
        notesHint: "The grade you'd like to see, and what it's for…",
      },
      {
        id: "season" as const,
        label: "Season supply",
        blurb: "Plan buying across a harvest",
        subject: "Season supply enquiry",
        image: photos.apples,
        withProducts: true,
        withQuantity: true,
        withDelivery: true,
        notesLabel: "Notes",
        notesHint: "How often you'd like deliveries, and for how long…",
      },
      {
        id: "other" as const,
        label: "Something else",
        blurb: "Any other question",
        subject: "Message",
        image: photos.valley,
        withProducts: false,
        withQuantity: false,
        withDelivery: false,
        notesLabel: "Your message",
        notesHint: "How can we help?",
      },
    ],
    season: {
      title: "What's coming off the land",
      summary: "Each crop has its own window, so it helps to plan ahead. Add anything you're interested in to your enquiry.",
      image: photos.saffronField,
    },
    // Prompts for what to include, not claims about who already buys from us.
    buyers: {
      title: "Tell us who you're buying for",
      summary: "What's worth mentioning depends on your business. Pick the closest match and we'll set up the right enquiry.",
      types: [
        {
          id: "traders",
          label: "Traders",
          title: "Buying and reselling by the lot",
          body: "Price and consistency across a lot usually matter most, so give us the numbers you're working with.",
          mention: ["The quantity per lot", "The grade and size you trade in", "Where the lot needs to reach"],
          intentId: "order" as const,
          action: "Start a bulk order",
          image: photos.walnuts,
        },
        {
          id: "brands",
          label: "Food brands",
          title: "Making or packing your own products",
          body: "Most brands want to check an ingredient before committing, so starting with a sample is a sensible first step.",
          mention: ["What you'll use it in", "The specification you work to", "Any packing you need"],
          intentId: "sample" as const,
          action: "Request a sample",
          image: photos.chilli,
        },
        {
          id: "distributors",
          label: "Distributors",
          title: "Keeping regular customers supplied",
          body: "If you buy repeatedly, tell us how the year looks for you and we can plan around the harvest together.",
          mention: ["Your expected volume across the year", "How often you'd like deliveries", "Which regions you supply"],
          intentId: "season" as const,
          action: "Plan season supply",
          image: photos.apples,
        },
        {
          id: "others",
          label: "Someone else",
          title: "Hotels, caterers, retailers and others",
          body: "If you don't fit neatly into a category, that's fine. Tell us what you're trying to do and we'll take it from there.",
          mention: ["What your business does", "What you're looking for", "Roughly when you need it"],
          intentId: "other" as const,
          action: "Send us a message",
          image: photos.cherries,
        },
      ],
    },
    channels,
    // The same three steps the home page promises.
    steps: [
      { title: "Tell us what you need", body: "Products, quantity, form and where it ships." },
      { title: "We confirm the details", body: "Grade, packing, price and timing, agreed before anything moves." },
      { title: "Order and dispatch", body: "Your order is packed and sent on the agreed schedule." },
    ],
    faqs: [
      {
        question: "Is there a minimum order?",
        answer: "It depends on the product. Where one is set, it's on the product's page. If not, tell us the quantity you have in mind.",
        link: { href: "/products", label: "Browse products" },
      },
      {
        question: "When can I buy each crop?",
        answer: "Each crop comes in at its own time of year. The harvest calendar shows what's in season, month by month.",
        link: { href: "/#harvest", label: "See the harvest calendar" },
      },
      {
        question: "Can you source something that isn't listed?",
        answer: "Ask us. Choose \"Something else\" above and describe what you're looking for.",
      },
      {
        question: "What should I include in an enquiry?",
        answer: "The products, a rough quantity, the form you want and where it ships. If you don't know something yet, leave it blank and we'll work it out together.",
      },
    ],
  };
}

export type ContactContent = Awaited<ReturnType<typeof getContactContent>>;
export type ContactIntent = ContactContent["intents"][number];
