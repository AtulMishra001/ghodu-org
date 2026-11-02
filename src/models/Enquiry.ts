import "server-only";
import { model, models, Schema, type Model } from "mongoose";
import { ENQUIRY_FORMS } from "@/lib/enquiry";

const itemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    form: { type: String, trim: true, maxlength: 60 },
    qty: { type: Number, min: 0 },
    unit: { type: String, enum: ["kg", "t"] },
  },
  { _id: false },
);

// An enquiry sent from any form on the website. Listed in /admin/enquiries.
const enquirySchema = new Schema(
  {
    /** Which form it came from. */
    form: { type: String, enum: Object.keys(ENQUIRY_FORMS), required: true, index: true },
    subject: { type: String, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 160 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** Phone number or email address. */
    contact: { type: String, required: true, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 160 },
    message: { type: String, trim: true, maxlength: 2000 },
    items: { type: [itemSchema], default: [] },
    pageUrl: { type: String, trim: true, maxlength: 500 },
    source: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export const EnquiryModel = (models.Enquiry as Model<Record<string, unknown>>) ?? model("Enquiry", enquirySchema);
