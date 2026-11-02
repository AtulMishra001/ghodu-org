import { productCategories, type ProductCategory } from "@/data/categories";
import { availabilityOptions, quantityUnits, type Availability, type ProductOrdering, type QuantityUnit } from "@/data/ordering";
import type { Faq } from "@/lib/faq";
import { htmlToText, isBlankHtml, toHtml } from "@/lib/rich-text";

// The admin form works on a ProductDraft (strings for number inputs, so a
// half-typed field never breaks the form). parseProductInput turns a draft
// into a clean ProductInput — in the browser for instant feedback, and again
// on the server, which is the check that counts.

export const limits = {
  name: 60,
  slug: 60,
  localName: 40,
  kind: 30,
  summary: 200,
  /** Visible characters of the full description (tags not counted). */
  description: 2000,
  /** Stored HTML of the full description, formatting included. */
  descriptionHtml: 50_000,
  form: 30,
  forms: 6,
  alt: 160,
  /** Extra photos besides the cover. */
  gallery: 8,
  specs: 12,
  specLabel: 40,
  specValue: 120,
  packaging: 6,
  packLabel: 40,
  regions: 10,
  region: 40,
  /** Short free-text ordering fields (payment terms, sample note…). */
  shortText: 200,
  orderNotes: 1000,
  faqs: 20,
  faqQuestion: 200,
  faqAnswer: 1500,
};

export type CoverImageInput = { url: string; publicId: string; alt: string };

export type ProductDraft = {
  name: string;
  slug: string;
  localName: string;
  category: ProductCategory;
  kind: string;
  summary: string;
  description: string;
  harvest: number[];
  forms: string[];
  specs: { label: string; value: string }[];
  faqs: Faq[];
  coverImage: CoverImageInput | null;
  gallery: string[];
  published: boolean;
  ordering: {
    moqValue: string;
    moqUnit: QuantityUnit;
    availability: Availability;
    packaging: { label: string; value: string; unit: QuantityUnit }[];
    leadMin: string;
    leadMax: string;
    samplesAvailable: boolean;
    samplesNote: string;
    paymentTerms: string;
    deliveryRegions: string[];
    notes: string;
  };
};

export type ProductInput = {
  name: string;
  slug: string;
  localName?: string;
  category: ProductCategory;
  kind: string;
  summary: string;
  description?: string;
  harvest: number[];
  forms: string[];
  specs: { label: string; value: string }[];
  faqs: Faq[];
  /** Optional: products can be listed before their photos are ready. */
  coverImage?: CoverImageInput;
  gallery: string[];
  published: boolean;
  ordering: ProductOrdering;
};

export type ProductErrorKey =
  | "name"
  | "slug"
  | "localName"
  | "category"
  | "kind"
  | "summary"
  | "description"
  | "harvest"
  | "forms"
  | "specs"
  | "faqs"
  | "coverImage"
  | "coverAlt"
  | "gallery"
  | "moq"
  | "packaging"
  | "leadTime"
  | "samples"
  | "paymentTerms"
  | "deliveryRegions"
  | "orderNotes";

/** Field errors, keyed by the field ids used in the admin form. */
export type ProductErrors = Partial<Record<ProductErrorKey, string>>;

export function emptyDraft(): ProductDraft {
  return {
    name: "",
    slug: "",
    localName: "",
    category: productCategories[0],
    kind: "",
    summary: "",
    description: "",
    harvest: [],
    forms: [],
    specs: [],
    faqs: [{ question: "", answer: "" }],
    coverImage: null,
    gallery: [],
    published: true,
    ordering: {
      moqValue: "",
      moqUnit: "kg",
      availability: "available",
      packaging: [],
      leadMin: "",
      leadMax: "",
      samplesAvailable: false,
      samplesNote: "",
      paymentTerms: "",
      deliveryRegions: [],
      notes: "",
    },
  };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, limits.slug);
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const list = (v: unknown) => (Array.isArray(v) ? v : []);
/** "" → null, otherwise a number (possibly NaN). */
const num = (v: unknown) => {
  const s = typeof v === "number" ? String(v) : str(v);
  return s === "" ? null : Number(s);
};
const unit = (v: unknown): QuantityUnit | null => (quantityUnits.includes(v as QuantityUnit) ? (v as QuantityUnit) : null);

/** Normalises an untrusted draft and returns either clean data or field errors. */
export function parseProductInput(raw: unknown): { data: ProductInput; errors: null } | { data: null; errors: ProductErrors } {
  const r = obj(raw);
  const o = obj(r.ordering);
  const errors: ProductErrors = {};

  // ---------- basics ----------
  const name = str(r.name);
  if (name.length < 2) errors.name = "Enter the product name.";
  else if (name.length > limits.name) errors.name = `Keep it under ${limits.name} characters.`;

  const slug = str(r.slug) || slugify(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > limits.slug)
    errors.slug = "Use lowercase letters, numbers and dashes, e.g. walnut-kernels.";

  const localName = str(r.localName);
  if (localName.length > limits.localName) errors.localName = `Keep it under ${limits.localName} characters.`;

  const category = r.category as ProductCategory;
  if (!productCategories.includes(category)) errors.category = "Choose a product line.";

  const kind = str(r.kind);
  if (kind.length < 2) errors.kind = "Add a short type, e.g. Tree nut.";
  else if (kind.length > limits.kind) errors.kind = `Keep it under ${limits.kind} characters.`;

  const summary = str(r.summary);
  if (summary.length < 10) errors.summary = "Write a one-line summary (10+ characters).";
  else if (summary.length > limits.summary) errors.summary = `Keep it under ${limits.summary} characters.`;

  // Rich text (HTML). An empty editor ("<p></p>") counts as no description;
  // the limit counts visible characters, not tags.
  const description = isBlankHtml(str(r.description)) ? "" : toHtml(str(r.description));
  if (htmlToText(description).length > limits.description) errors.description = `Keep it under ${limits.description} characters.`;
  else if (description.length > limits.descriptionHtml) errors.description = "This description has too much formatting. Simplify it or split the table.";

  // ---------- harvest, forms, specs ----------
  const harvest = [
    ...new Set(list(r.harvest).filter((m): m is number => Number.isInteger(m) && m >= 0 && m <= 11)),
  ].sort((a, b) => a - b);
  if (harvest.length === 0) errors.harvest = "Pick at least one harvest month.";

  const forms = [...new Set(list(r.forms).map(str).filter(Boolean))];
  if (forms.length === 0) errors.forms = "Add at least one form, e.g. Kernels.";
  else if (forms.length > limits.forms) errors.forms = `Up to ${limits.forms} forms.`;
  else if (forms.some((f) => f.length > limits.form)) errors.forms = `Each form must be under ${limits.form} characters.`;

  const specs = list(r.specs)
    .map((s) => ({ label: str(obj(s).label), value: str(obj(s).value) }))
    .filter((s) => s.label || s.value);
  if (specs.length > limits.specs) errors.specs = `Up to ${limits.specs} specifications.`;
  else if (specs.some((s) => !s.label || !s.value)) errors.specs = "Each specification needs a name and a value.";
  else if (specs.some((s) => s.label.length > limits.specLabel || s.value.length > limits.specValue))
    errors.specs = `Keep names under ${limits.specLabel} and values under ${limits.specValue} characters.`;

  // ---------- FAQs ----------
  // Fully blank rows are dropped; a half-filled one is an error, not lost text.
  const faqs = list(r.faqs)
    .map((f) => ({ question: str(obj(f).question), answer: str(obj(f).answer) }))
    .filter((f) => f.question || f.answer);
  const incomplete = faqs.findIndex((f) => !f.question || !f.answer);
  const oversized = faqs.findIndex((f) => f.question.length > limits.faqQuestion || f.answer.length > limits.faqAnswer);
  if (faqs.length > limits.faqs) errors.faqs = `Up to ${limits.faqs} FAQs.`;
  else if (incomplete !== -1) errors.faqs = `FAQ ${incomplete + 1} needs both a question and an answer.`;
  else if (oversized !== -1) errors.faqs = `FAQ ${oversized + 1} is too long: keep questions under ${limits.faqQuestion} and answers under ${limits.faqAnswer} characters.`;

  // ---------- photos ----------
  const c = obj(r.coverImage);
  let coverImage: CoverImageInput | null = null;
  if (str(c.url) || str(c.publicId)) {
    if (!str(c.url) || !str(c.publicId)) errors.coverImage = "Upload the cover photo again.";
    coverImage = { url: str(c.url), publicId: str(c.publicId), alt: str(c.alt) };
    if (coverImage.alt.length < 3) errors.coverAlt = "Describe the cover photo for screen readers.";
    else if (coverImage.alt.length > limits.alt) errors.coverAlt = `Keep it under ${limits.alt} characters.`;
  }

  const gallery = [...new Set(list(r.gallery).map(str).filter(Boolean))];
  if (gallery.length > limits.gallery) errors.gallery = `Up to ${limits.gallery} gallery photos.`;
  else if (gallery.some((u) => !u.startsWith("https://res.cloudinary.com/"))) errors.gallery = "Upload gallery photos again.";

  // ---------- ordering ----------
  const ordering: ProductOrdering = {
    availability: availabilityOptions.includes(o.availability as Availability) ? (o.availability as Availability) : "available",
    packaging: [],
    deliveryRegions: [],
  };

  const moqValue = num(o.moqValue);
  const moqUnit = unit(o.moqUnit);
  if (moqValue !== null) {
    if (!Number.isFinite(moqValue) || moqValue <= 0) errors.moq = "Enter a quantity above 0, or leave it blank.";
    else if (!moqUnit) errors.moq = "Choose a unit.";
    else ordering.moq = { value: moqValue, unit: moqUnit };
  }

  const packs = list(o.packaging)
    .map((p) => ({ label: str(obj(p).label), value: num(obj(p).value), unit: unit(obj(p).unit) }))
    .filter((p) => p.label || p.value !== null);
  if (packs.length > limits.packaging) errors.packaging = `Up to ${limits.packaging} packing options.`;
  else if (packs.some((p) => !p.label || p.label.length > limits.packLabel))
    errors.packaging = `Name each packing option (under ${limits.packLabel} characters).`;
  else if (packs.some((p) => p.value === null || !Number.isFinite(p.value) || p.value <= 0 || !p.unit))
    errors.packaging = "Give each packing option a size above 0 and a unit.";
  else ordering.packaging = packs.map((p) => ({ label: p.label, size: { value: p.value!, unit: p.unit! } }));

  const leadMin = num(o.leadMin);
  const leadMax = num(o.leadMax);
  if (leadMin !== null || leadMax !== null) {
    const min = leadMin ?? leadMax!;
    const max = leadMax ?? leadMin!;
    if (![min, max].every((d) => Number.isInteger(d) && d >= 0 && d <= 365)) errors.leadTime = "Use whole days between 0 and 365.";
    else if (max < min) errors.leadTime = "The maximum can't be less than the minimum.";
    else ordering.leadTimeDays = { min, max };
  }

  const samplesNote = str(o.samplesNote);
  if (samplesNote.length > limits.shortText) errors.samples = `Keep it under ${limits.shortText} characters.`;
  else if (o.samplesAvailable === true || samplesNote)
    ordering.samples = { available: o.samplesAvailable === true, ...(samplesNote ? { note: samplesNote } : {}) };

  const paymentTerms = str(o.paymentTerms);
  if (paymentTerms.length > limits.shortText) errors.paymentTerms = `Keep it under ${limits.shortText} characters.`;
  else if (paymentTerms) ordering.paymentTerms = paymentTerms;

  const regions = [...new Set(list(o.deliveryRegions).map(str).filter(Boolean))];
  if (regions.length > limits.regions) errors.deliveryRegions = `Up to ${limits.regions} regions.`;
  else if (regions.some((g) => g.length > limits.region)) errors.deliveryRegions = `Each region must be under ${limits.region} characters.`;
  else ordering.deliveryRegions = regions;

  const notes = str(o.notes);
  if (notes.length > limits.orderNotes) errors.orderNotes = `Keep it under ${limits.orderNotes} characters.`;
  else if (notes) ordering.notes = notes;

  if (Object.keys(errors).length) return { data: null, errors };
  return {
    data: {
      name,
      slug,
      ...(localName ? { localName } : {}),
      category,
      kind,
      summary,
      ...(description ? { description } : {}),
      harvest,
      forms,
      specs,
      faqs,
      ...(coverImage ? { coverImage } : {}),
      gallery,
      published: r.published === true,
      ordering,
    },
    errors: null,
  };
}
