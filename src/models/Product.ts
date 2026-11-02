import "server-only";
import { model, models, Schema, type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import { productCategories } from "@/data/categories";
import { availabilityOptions, quantityUnits } from "@/data/ordering";
import { limits } from "@/lib/product-input";

// A product in the catalogue. The limits are shared with the admin form
// (lib/product-input.ts), so the browser, the server action and the database
// all enforce the same rules.

const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\//;

const creditSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    license: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

/** The cover photo: shown on cards, in the hero showcase and first in the gallery. */
const coverImageSchema = new Schema(
  {
    /** Cloudinary delivery URL. */
    url: { type: String, required: true, trim: true, match: [CLOUDINARY_URL, "Image must be hosted on Cloudinary"] },
    /** Cloudinary public_id, returned by the upload: used to delete the file when it's replaced or removed. */
    publicId: { type: String, required: true, trim: true },
    /** Alt text: read by screen readers and search engines. */
    alt: { type: String, required: true, trim: true, minlength: 3, maxlength: limits.alt },
    /** Tiny base64 preview shown while the photo loads. */
    blurDataURL: { type: String },
    /** Only for stock photos whose licence requires attribution. */
    credit: { type: creditSchema, default: undefined },
  },
  { _id: false },
);

/** An amount with its unit, e.g. 500 kg or 2 tonne. */
const quantitySchema = new Schema(
  {
    value: { type: Number, required: true, min: [0.01, "Must be more than 0"] },
    unit: { type: String, required: true, enum: quantityUnits },
  },
  { _id: false },
);

/** A packing option, e.g. "Jute bag" of 25 kg. */
const packSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: limits.packLabel },
    size: { type: quantitySchema, required: true },
  },
  { _id: false },
);

/** A labelled specification row, e.g. { label: "Moisture", value: "Below 8%" }. */
const specSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: limits.specLabel },
    value: { type: String, required: true, trim: true, maxlength: limits.specValue },
  },
  { _id: false },
);

/** One question and answer, shown on the product's page. Plain text. */
const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: limits.faqQuestion },
    answer: { type: String, required: true, trim: true, maxlength: limits.faqAnswer },
  },
  { _id: false },
);

/** Everything a buyer needs to know before placing an order. All optional; blanks show as "On request". */
const orderingSchema = new Schema(
  {
    /** Minimum order quantity, e.g. 100 kg. */
    moq: { type: quantitySchema, default: undefined },
    /** Current supply status, shown as a badge. */
    availability: { type: String, enum: availabilityOptions, default: "available" },
    /** Packing options the buyer can choose from. */
    packaging: {
      type: [packSchema],
      default: [],
      validate: { validator: (v: unknown[]) => v.length <= limits.packaging, message: `Up to ${limits.packaging} packing options` },
    },
    /** Days from order confirmation to dispatch. */
    leadTimeDays: {
      type: new Schema(
        {
          min: { type: Number, required: true, min: 0 },
          max: { type: Number, required: true, min: 0 },
        },
        { _id: false },
      ),
      default: undefined,
      validate: {
        validator: (v?: { min: number; max: number }) => !v || v.max >= v.min,
        message: "Maximum lead time can't be less than the minimum",
      },
    },
    /** Whether buyers can request a sample, and on what terms. */
    samples: {
      type: new Schema(
        {
          available: { type: Boolean, default: false },
          note: { type: String, trim: true, maxlength: limits.shortText }, // e.g. "250 g sample, courier charges extra"
        },
        { _id: false },
      ),
      default: undefined,
    },
    /** e.g. "50% advance, balance before dispatch". */
    paymentTerms: { type: String, trim: true, maxlength: limits.shortText },
    /** Where it can be delivered, e.g. ["Pan-India", "UAE"]. */
    deliveryRegions: {
      type: [{ type: String, trim: true, maxlength: limits.region }],
      default: [],
      validate: { validator: (v: string[]) => v.length <= limits.regions, message: `Up to ${limits.regions} regions` },
    },
    /** Anything else about ordering: grading, inspection, custom packing, documents… */
    notes: { type: String, trim: true, maxlength: limits.orderNotes },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: limits.name },
    /** URL-safe ID used in links and enquiries, e.g. "walnut-kernels". */
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: limits.slug,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and dashes"],
    },
    /** Kashmiri name, e.g. "Doon". */
    localName: { type: String, trim: true, maxlength: limits.localName },
    /** Line of business: "Dry fruits" or "Crops". */
    category: { type: String, required: true, enum: productCategories },
    /** Short type shown on cards, e.g. "Tree nut", "Spice", "Orchard fruit". */
    kind: { type: String, required: true, trim: true, minlength: 2, maxlength: limits.kind },
    /** One-line description for cards. */
    summary: { type: String, required: true, trim: true, minlength: 10, maxlength: limits.summary },
    /**
     * Full description as rich text (sanitised HTML from the admin editor).
     * The visible-text limit is checked before saving; this caps the stored HTML.
     */
    description: { type: String, trim: true, maxlength: limits.descriptionHtml },
    /** Harvest months, 0 = January … 11 = December. */
    harvest: {
      type: [{ type: Number, min: 0, max: 11 }],
      required: true,
      validate: [
        { validator: (v: number[]) => v.length > 0, message: "Pick at least one harvest month" },
        {
          validator: (v: number[]) => v.every(Number.isInteger) && new Set(v).size === v.length,
          message: "Harvest months must be unique whole numbers",
        },
      ],
    },
    /** Forms supplied, e.g. ["In-shell", "Kernels"]. */
    forms: {
      type: [{ type: String, trim: true, maxlength: limits.form }],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= limits.forms,
        message: `Between 1 and ${limits.forms} forms`,
      },
    },
    /** Quality specs shown as a table, e.g. grade, size, moisture, shelf life. */
    specs: {
      type: [specSchema],
      default: [],
      validate: { validator: (v: unknown[]) => v.length <= limits.specs, message: `Up to ${limits.specs} specifications` },
    },
    /** Answers shown on the product page, and given to search engines as structured data. */
    faqs: {
      type: [faqSchema],
      default: [],
      validate: { validator: (v: unknown[]) => v.length <= limits.faqs, message: `Up to ${limits.faqs} FAQs` },
    },
    /** Optional so products can be listed before their photos are ready. */
    coverImage: { type: coverImageSchema, default: undefined },
    /** Extra photos (Cloudinary URLs), shown after the cover in the product's gallery. */
    gallery: {
      type: [{ type: String, trim: true, match: [CLOUDINARY_URL, "Gallery images must be hosted on Cloudinary"] }],
      default: [],
      validate: [
        { validator: (v: string[]) => v.length <= limits.gallery, message: `Up to ${limits.gallery} gallery photos` },
        { validator: (v: string[]) => new Set(v).size === v.length, message: "The same photo is in the gallery twice" },
      ],
    },
    ordering: { type: orderingSchema, default: () => ({}) },
    /** Shown on the website when true; hidden products stay in the admin. */
    published: { type: Boolean, default: true },
    /** Display order on the website (lower comes first). */
    position: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: "products",
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

// Keep months in calendar order whatever order they were picked in.
productSchema.pre("validate", function () {
  if (Array.isArray(this.harvest)) this.harvest.sort((a, b) => a - b);
});

// The public site's query: published products in display order.
productSchema.index({ published: 1, position: 1 });

export type ProductRecord = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<ProductRecord>;

// Reuse the compiled model across hot reloads in dev.
export const ProductModel: Model<ProductRecord> =
  (models.Product as Model<ProductRecord> | undefined) ?? model<ProductRecord>("Product", productSchema);
