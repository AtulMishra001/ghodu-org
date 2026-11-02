import type { PageFaq } from "@/lib/faq";
import { photos, type Photo } from "./photos";

export type NoteLine = { text: string } | { photo: Photo };

// The about page loads everything through this function, so it can later be
// swapped for a CMS or database call without touching the components.
//
// TODO: PLACEHOLDER COPY. Every year, number, quote and story beat below is dummy
// content written to shape the page. Replace all of it with Ghodu Agro's real
// facts before launch.
export async function getAboutContent() {
  return {
    hero: {
      eyebrow: "About Ghodu Agro",
      titleStart: "Rooted in the valley.",
      titleAccent: "Built",
      titleEnd: "for business.",
      summary: "The story of how one family's orchard became a supply partner for businesses across India.",
      statement: "Every crate we ship starts here, between the mountains and the river.",
      caption: "Pahalgam valley, Kashmir",
      image: photos.valley,
    },
    story: {
      title: "From one orchard to a working supply chain",
      summary: "Five moments that shaped how we buy, grade and ship.",
      chapters: [
        {
          year: "2009",
          title: "It began with one orchard",
          body: "A family apple orchard, a borrowed truck and a simple idea: buyers outside the valley deserved fruit that arrived the way it left the tree.",
          image: photos.orchard,
        },
        {
          year: "2013",
          title: "Neighbours joined in",
          body: "Growers on nearby slopes asked us to carry their walnuts too. We learned to weigh fairly, pay on time and keep every lot separate.",
          image: photos.walnuts,
        },
        {
          year: "2017",
          title: "Saffron from Pampore",
          body: "Partnering with saffron growers taught us how much a harvest depends on patience. Those few autumn weeks now set the rhythm of our year.",
          image: photos.saffronField,
        },
        {
          year: "2021",
          title: "Our own grading floor",
          body: "We stopped relying on the market's word for quality. Almonds and walnuts now pass through our own hands, graded to the buyer's specification.",
          image: photos.almonds,
        },
        {
          year: "Today",
          title: "A partner for businesses",
          body: "Traders, brands and food businesses plan their buying around the valley's seasons with us, from a first sample to a full season's supply.",
          image: photos.apples,
        },
      ],
    },
    note: {
      lines: [
        { text: "We grew up among these" },
        { photo: photos.orchard },
        { text: "orchards, so we know what a good season costs. Our job is simple: carry that" },
        { photo: photos.saffron },
        { text: "care from the valley to your warehouse, with nothing lost on the way." },
      ] as NoteLine[],
      attribution: "Founder, Ghodu Agro",
    },
    journey: {
      title: ["From the slope", "to your dock"],
      summary: "What happens to a lot between the harvest and your warehouse.",
      stages: [
        { name: "Grow", title: "Grown on family land", body: "Small holdings across the valley, tended by the growers who have worked them for years.", tags: ["Partner growers", "Valley-wide"], image: photos.saffronField },
        { name: "Harvest", title: "Picked in season", body: "Nothing is rushed off the tree. Each crop comes in at its own time, and we plan around it.", tags: ["Hand-picked", "Season-planned"], image: photos.apples },
        { name: "Grade", title: "Graded to your spec", body: "Every lot is sorted on our floor by size, colour and quality, against what you asked for.", tags: ["Size", "Colour", "Moisture"], image: photos.almonds },
        { name: "Pack", title: "Packed for the distance", body: "Packing is agreed up front and matched to the product, the route and your storage.", tags: ["Bulk", "Private label"], image: photos.cherries },
        { name: "Ship", title: "Out of the valley", body: "Dispatched on the agreed schedule, with the paperwork ready and someone you can call.", tags: ["Scheduled", "Tracked"], image: photos.valley },
      ],
    },
    standards: {
      title: "What higher standards means to us",
      items: [
        { title: "Traceable lots", body: "We can tell you which part of the valley a lot came from, and who grew it.", image: photos.orchard },
        { title: "Honest grading", body: "The sample you approve is the grade you receive, across the whole order.", image: photos.walnuts },
        { title: "Fair to growers", body: "Prompt payment keeps our best growers with us, season after season.", image: photos.saffron },
        { title: "Straight answers", body: "If a harvest comes in short, you hear it from us early, not on dispatch day.", image: photos.chilli },
      ],
    },
    numbers: {
      title: "A growing operation",
      image: photos.orchard,
      stats: [
        { value: 15, suffix: "+", label: "Years in the valley" },
        { value: 120, suffix: "+", label: "Partner growers" },
        { value: 1200, suffix: " t", label: "Shipped each year" },
        { value: 18, suffix: "", label: "States supplied" },
      ],
    },
    faqImage: photos.saffronField,
    // The standards answer restates the placeholder copy above: update it with the rest.
    faqs: [
      {
        question: "What does Ghodu Agro do?",
        answer: "We source agricultural produce across the Kashmir valley and supply it in bulk to businesses, with the grade, packing and schedule agreed for each order.",
      },
      {
        question: "Where does your produce come from?",
        answer: "From the Kashmir valley. Walnuts, almonds, saffron, Kashmiri chilli and orchard fruit each come in at their own time of year.",
        link: { href: "/products", label: "See what we supply" },
      },
      {
        question: "What does \"higher standards\" mean in practice?",
        answer: "Traceable lots, honest grading, fairness to growers and straight answers when a harvest comes in short.",
      },
      {
        question: "Which businesses do you work with?",
        answer: "Traders, brands and food businesses that plan their buying around the valley's seasons.",
      },
      {
        question: "How do we start working together?",
        answer: "Tell us what your business needs this season. We'll come back with grade, packing and price.",
        link: { href: "/contact", label: "Contact us" },
      },
    ] satisfies PageFaq[],
    closing: {
      titleStart: "Become part of",
      titleAccent: "the next chapter",
      summary: "Tell us what your business needs this season. We'll come back with grade, packing and price.",
      columns: [
        [photos.apples, photos.walnuts, photos.saffron, photos.apples],
        [photos.almonds, photos.cherries, photos.chilli, photos.almonds],
        [photos.saffronField, photos.pears, photos.orchard, photos.saffronField],
      ],
    },
  };
}

export type AboutContent = Awaited<ReturnType<typeof getAboutContent>>;
