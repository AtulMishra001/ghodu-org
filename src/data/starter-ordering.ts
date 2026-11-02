import type { ProductOrdering } from "./ordering";

// Ordering details for the starter catalogue, keyed by product ID (slug).
// Seeded by `npm run seed:products`; edit them afterwards in the admin.
//
// TODO: confirm every value with Ghodu Agro. These are typical terms for
// the Kashmir dry-fruit and produce trade, not figures Ghodu Agro has given.

const ADVANCE_50 = "50% advance, balance before dispatch";
const ADVANCE_100 = "100% advance before dispatch";

export const starterOrdering: Record<string, ProductOrdering> = {
  walnuts: {
    availability: "available",
    moq: { value: 100, unit: "kg" },
    packaging: [
      { label: "Jute bag (in-shell)", size: { value: 25, unit: "kg" } },
      { label: "Vacuum-packed carton (kernels)", size: { value: 10, unit: "kg" } },
    ],
    leadTimeDays: { min: 5, max: 7 },
    samples: { available: true, note: "250 g of each grade, courier charges extra" },
    paymentTerms: ADVANCE_50,
    deliveryRegions: ["Pan-India", "Export"],
    notes: "In-shell walnuts are graded by nut size; kernels by colour (light, light amber) and halves or pieces. The grade is agreed before dispatch.",
  },
  almonds: {
    availability: "available",
    moq: { value: 100, unit: "kg" },
    packaging: [
      { label: "Jute bag (in-shell)", size: { value: 25, unit: "kg" } },
      { label: "Vacuum-packed carton (kernels)", size: { value: 10, unit: "kg" } },
    ],
    leadTimeDays: { min: 5, max: 7 },
    samples: { available: true, note: "250 g of each grade, courier charges extra" },
    paymentTerms: ADVANCE_50,
    deliveryRegions: ["Pan-India", "Export"],
    notes: "Graded by kernel size and evenness. Stored dry after the summer harvest, so supply runs through the year.",
  },
  saffron: {
    availability: "available",
    moq: { value: 500, unit: "g" },
    packaging: [
      { label: "Airtight tin", size: { value: 100, unit: "g" } },
      { label: "Light-proof bulk pouch", size: { value: 1, unit: "kg" } },
    ],
    leadTimeDays: { min: 3, max: 5 },
    samples: { available: true, note: "5 g sample, courier charges extra" },
    paymentTerms: ADVANCE_100,
    deliveryRegions: ["Pan-India", "Export"],
    notes: "Grade (Mongra or Lacha) agreed upfront. Packed in airtight, light-proof containers to hold its colour and aroma.",
  },
  "kashmiri-chilli": {
    availability: "available",
    moq: { value: 200, unit: "kg" },
    packaging: [
      { label: "Jute bag", size: { value: 25, unit: "kg" } },
      { label: "Carton", size: { value: 10, unit: "kg" } },
    ],
    leadTimeDays: { min: 5, max: 7 },
    samples: { available: true, note: "250 g sample, courier charges extra" },
    paymentTerms: ADVANCE_50,
    deliveryRegions: ["Pan-India"],
    notes: "Sun-dried whole chillies, sorted for colour. Stemless or with stems on request.",
  },
  apples: {
    availability: "available",
    moq: { value: 100, unit: "box" },
    packaging: [{ label: "Corrugated apple box", size: { value: 18, unit: "kg" } }],
    leadTimeDays: { min: 2, max: 4 },
    samples: { available: true, note: "One box during the harvest season" },
    paymentTerms: ADVANCE_50,
    deliveryRegions: ["Pan-India"],
    notes: "Supplied through the harvest season. Variety and size grade confirmed when the order is placed.",
  },
  pears: {
    availability: "available",
    moq: { value: 100, unit: "box" },
    packaging: [{ label: "Corrugated fruit box", size: { value: 15, unit: "kg" } }],
    leadTimeDays: { min: 2, max: 4 },
    samples: { available: true, note: "One box during the harvest season" },
    paymentTerms: ADVANCE_50,
    deliveryRegions: ["Pan-India"],
    notes: "Supplied through the harvest season. Picked firm so they ripen in transit.",
  },
  cherries: {
    availability: "pre-order",
    moq: { value: 50, unit: "box" },
    packaging: [{ label: "Ventilated punnet box", size: { value: 2, unit: "kg" } }],
    leadTimeDays: { min: 1, max: 2 },
    samples: { available: false },
    paymentTerms: ADVANCE_100,
    deliveryRegions: ["Delhi NCR", "Jammu & Kashmir"],
    notes: "Highly perishable: dispatched within a day or two of picking in May and June. Pre-orders are confirmed in order of booking.",
  },
};
