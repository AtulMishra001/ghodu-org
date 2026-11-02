// Option lists for how a product is ordered. Shared by the Mongoose model,
// the admin form and the public spec sheet, so labels stay consistent.

/** Units a minimum order or a pack size can be expressed in. */
export const quantityUnits = ["g", "kg", "tonne", "box", "carton", "bag", "crate"] as const;
export type QuantityUnit = (typeof quantityUnits)[number];

/** Current supply status, shown as a badge next to the harvest season. */
export const availabilityOptions = ["available", "limited", "pre-order", "unavailable"] as const;
export type Availability = (typeof availabilityOptions)[number];

export const availabilityLabels: Record<Availability, string> = {
  available: "Available now",
  limited: "Limited stock",
  "pre-order": "Taking pre-orders",
  unavailable: "Currently unavailable",
};

export type Quantity = { value: number; unit: QuantityUnit };
export type PackOption = { label: string; size: Quantity };

/** How a product is ordered. Every field is optional; blanks show as "On request". */
export type ProductOrdering = {
  moq?: Quantity;
  availability: Availability;
  packaging: PackOption[];
  leadTimeDays?: { min: number; max: number };
  samples?: { available: boolean; note?: string };
  paymentTerms?: string;
  deliveryRegions: string[];
  notes?: string;
};

const plurals: Record<QuantityUnit, string> = { g: "g", kg: "kg", tonne: "tonnes", box: "boxes", carton: "cartons", bag: "bags", crate: "crates" };

/** "100 kg", "2 tonnes", "1 carton". */
export const formatQuantity = (q: Quantity) => `${q.value.toLocaleString("en-IN")} ${q.value === 1 ? q.unit : plurals[q.unit]}`;

export const formatLeadTime = (l: { min: number; max: number }) =>
  l.min === l.max ? `${l.min} day${l.min === 1 ? "" : "s"}` : `${l.min}–${l.max} days`;
