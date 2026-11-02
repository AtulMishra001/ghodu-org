import { site } from "./site";

// The locked author on every post. TODO: swap in a real name and profile page
// when Ghodu Agro has one; no real editor is on record yet.
export const BLOG_AUTHOR = {
  name: `${site.name} Editorial Team`,
  role: "Sourcing & Quality Desk",
  profileUrl: "/about-us",
} as const;

// Starting options in the form's category list. Editors can add their own from
// the form; any category used on a post then appears here and on the archive.
export const STARTER_BLOG_CATEGORIES = ["Buying Guides", "Harvest & Seasons", "Market Insights", "Product Knowledge", "Quality & Grading"];

/** Cloudinary folders for blog images: hero images, and images inside articles. */
export const BLOG_IMAGE_FOLDER = "ghodu-agro/Blogs";
export const BLOG_CONTENT_IMAGE_FOLDER = "ghodu-agro/Blogs/content";
export const BLOG_HERO_MAX_BYTES = 2 * 1024 * 1024;
export const BLOG_CONTENT_IMAGE_MAX_BYTES = 1024 * 1024;

export const blogArchive = {
  label: `${site.name} Journal`,
  metaTitle: `Kashmir produce guides for bulk buyers | ${site.name} Blog`,
  metaDescription:
    "Practical guides for bulk buyers of Kashmir dry fruits and crops: harvest timing, grading, packing and how to brief a supplier, from the Ghodu Agro team.",
  title: "Notes on buying Kashmir produce in bulk",
  // Kept to 40–55 words: the direct answer search engines and buyers read first.
  answer:
    "This blog helps procurement teams, traders and food brands buy Kashmir dry fruits and crops with fewer surprises. It explains when each crop is harvested, how grades and packing differ, and what to include in an enquiry, so you can compare suppliers and plan orders with confidence.",
  whatWePublish: {
    title: "What we publish",
    summary: "Each article is written to help you make a buying decision, not to fill a page.",
    items: [
      { title: "Harvest and season guides", body: "When each Kashmir crop comes in, and how that affects the timing of your orders." },
      { title: "Grading and quality explainers", body: "What the grades, forms and specifications on a quote mean, and which questions to ask about them." },
      { title: "Packing and logistics notes", body: "How bulk produce is packed and moved, and what to agree before dispatch." },
      { title: "Buyer checklists", body: "What to put in an enquiry so that a supplier can give you a useful answer the first time." },
    ],
  },
  guidance: {
    title: "Ready to go further?",
    summary: "Reading helps you plan. These pages help you act on it.",
    cards: [
      { title: "Browse the catalogue", body: "Specifications, harvest months and ordering details for each product.", href: "/products", cta: "View products" },
      { title: "Check the harvest calendar", body: "See what's in season month by month before you plan an order.", href: "/#harvest", cta: "See the calendar" },
      { title: "Meet Ghodu Agro", body: "Who we are, where we source from and how we work with buyers.", href: "/about-us", cta: "About us" },
    ],
    contact: { title: "Have a specific requirement?", body: "Tell us the product, grade and quantity.", href: "/contact", cta: "Contact us" },
  },
  editorial: {
    title: "Who writes and reviews these articles",
    body: `Articles are written and reviewed by the ${BLOG_AUTHOR.name}. Each one is checked before it goes live and updated when the details change, and the date at the top of every post shows when that last happened.`,
  },
  faqs: [
    {
      question: "Who is this blog for?",
      answer: "Procurement managers, traders, distributors and food brands that buy Kashmir dry fruits and crops in bulk, or are thinking about doing so.",
    },
    {
      question: "Who writes the articles?",
      answer: `The ${BLOG_AUTHOR.name}. The team's name appears on every post, along with the date it was last updated.`,
    },
    {
      question: "Are the articles a substitute for a quote?",
      answer: "No. They explain how things generally work. Grade, packing, price and availability are confirmed for each order, so send an enquiry for details specific to you.",
    },
    {
      question: "Can I ask about a topic I don't see here?",
      answer: "Yes. Use the contact page or the enquiry form on any article and tell us what you'd like to know.",
    },
  ],
};
