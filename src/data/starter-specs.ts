// Specification rows for the starter catalogue, keyed by product ID (slug).
// Seeded by `npm run seed:products`; edit them afterwards in the admin.
//
// TODO: confirm every value with Ghodu Agro. These are typical figures for
// Kashmir produce, not test results or grades Ghodu Agro has given.

type Spec = { label: string; value: string };

const DRY_STORAGE: Spec = { label: "Storage", value: "Cool, dry place away from direct sunlight" };

export const starterSpecs: Record<string, Spec[]> = {
  walnuts: [
    { label: "Grade", value: "Kernels: extra light, light or light amber; in-shell by nut size" },
    { label: "Nut size (in-shell)", value: "30 mm and above" },
    { label: "Kernel form", value: "Halves or quarters" },
    { label: "Moisture", value: "Below 8%" },
    { label: "Shelf life", value: "12 months" },
    DRY_STORAGE,
  ],
  almonds: [
    { label: "Variety", value: "Kashmiri almond" },
    { label: "Kernel size", value: "Small to medium, even-sized" },
    { label: "Taste", value: "Naturally sweet, oil-rich" },
    { label: "Moisture", value: "Below 6%" },
    { label: "Shelf life", value: "12 months" },
    DRY_STORAGE,
  ],
  saffron: [
    { label: "Grade", value: "Mongra (stigma only) or Lacha (stigma with style)" },
    { label: "Colour", value: "Deep crimson threads" },
    { label: "Moisture", value: "Below 10%" },
    { label: "Shelf life", value: "24 months" },
    { label: "Storage", value: "Airtight container, away from light and moisture" },
  ],
  "kashmiri-chilli": [
    { label: "Colour", value: "Deep red" },
    { label: "Heat", value: "Mild" },
    { label: "Form", value: "Whole dried, stemless or with stems" },
    { label: "Moisture", value: "Below 11%" },
    { label: "Shelf life", value: "12 months" },
    DRY_STORAGE,
  ],
  apples: [
    { label: "Varieties", value: "Delicious, American, Maharaji (by season)" },
    { label: "Size grade", value: "Graded by count per box" },
    { label: "Colour", value: "Red to deep red" },
    { label: "Shelf life", value: "Up to 3 months in cold storage" },
    { label: "Storage", value: "Cold storage at 0–4 °C" },
  ],
  pears: [
    { label: "Varieties", value: "Nakh, Babugosha (by season)" },
    { label: "Size grade", value: "Graded by count per box" },
    { label: "Picked", value: "Firm, to ripen in transit" },
    { label: "Shelf life", value: "2–3 weeks chilled" },
    { label: "Storage", value: "Cold storage at 0–4 °C" },
  ],
  cherries: [
    { label: "Varieties", value: "Mishri, Makhmali, Double, Italy (by season)" },
    { label: "Colour", value: "Bright red to deep crimson" },
    { label: "Shelf life", value: "7–10 days chilled" },
    { label: "Storage", value: "Cold chain at 0–2 °C" },
  ],
};
