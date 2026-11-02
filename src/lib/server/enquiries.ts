import "server-only";
import { ENQUIRY_FORMS, type EnquiryFormId, type EnquiryUnit } from "@/lib/enquiry";
import { EnquiryModel } from "@/models/Enquiry";
import { connectDB } from "./mongoose";

export type EnquiryItem = { name: string; form?: string; qty?: number; unit?: EnquiryUnit };

export type Enquiry = {
  _id: string;
  form: EnquiryFormId;
  subject?: string;
  company?: string;
  name: string;
  contact: string;
  city?: string;
  message?: string;
  items: EnquiryItem[];
  pageUrl?: string;
  source?: string;
  createdAt: string;
};

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function isPhone(value: string) {
  const digits = value.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15 && !/[^\d\s()+-]/.test(value);
}

/** Turns a request body into a clean enquiry, or returns what's wrong with it. */
export function parseEnquiry(body: Record<string, unknown>): { data: Omit<Enquiry, "_id" | "createdAt"> } | { error: string } {
  if (typeof body.form !== "string" || !Object.hasOwn(ENQUIRY_FORMS, body.form)) return { error: "Invalid enquiry." };
  const name = text(body.name, 120);
  const contact = text(body.contact, 160);
  if (!name || !contact) return { error: "Please enter your name and a phone number or email." };
  if (!isEmail(contact) && !isPhone(contact)) return { error: "Please enter a valid phone number or email." };

  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 30).flatMap((raw): EnquiryItem[] => {
    const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const itemName = text(item.name, 120);
    if (!itemName) return [];
    const qty = Number(item.qty);
    const hasQty = Number.isFinite(qty) && qty > 0;
    return [{ name: itemName, form: text(item.form, 60), ...(hasQty ? { qty, unit: item.unit === "t" ? "t" : "kg" } : {}) }];
  });

  const pageUrl = text(body.pageUrl, 500);
  return {
    data: {
      form: body.form as EnquiryFormId,
      subject: text(body.subject, 120),
      company: text(body.company, 160),
      name,
      contact,
      city: text(body.city, 160),
      message: text(body.message, 2000),
      items,
      // Shown as a link in the admin, so only web addresses are kept.
      pageUrl: /^https?:\/\//i.test(pageUrl) ? pageUrl : "",
      source: text(body.source, 200),
    },
  };
}

export async function saveEnquiry(data: Omit<Enquiry, "_id" | "createdAt">) {
  await connectDB();
  await EnquiryModel.create(data);
}

export const ENQUIRY_PAGE_SIZE = 20;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Newest first. Search and filter run in the database, so they cover every enquiry. */
export async function listEnquiries({ form, search, page }: { form?: EnquiryFormId; search?: string; page: number }) {
  await connectDB();
  const term = search?.trim().slice(0, 100);
  const pattern = term ? { $regex: escapeRegex(term), $options: "i" } : null;
  const filter = {
    ...(form ? { form } : {}),
    ...(pattern ? { $or: ["name", "company", "contact", "city", "message", "subject", "items.name"].map((field) => ({ [field]: pattern })) } : {}),
  };
  const [rows, total, byForm] = await Promise.all([
    EnquiryModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * ENQUIRY_PAGE_SIZE).limit(ENQUIRY_PAGE_SIZE).lean(),
    EnquiryModel.countDocuments(filter),
    EnquiryModel.aggregate<{ _id: EnquiryFormId; count: number }>([{ $group: { _id: "$form", count: { $sum: 1 } } }]),
  ]);
  const enquiries = JSON.parse(JSON.stringify(rows)) as Enquiry[];
  return { enquiries, total, pages: Math.max(1, Math.ceil(total / ENQUIRY_PAGE_SIZE)), counts: Object.fromEntries(byForm.map((row) => [row._id, row.count])) as Partial<Record<EnquiryFormId, number>> };
}

export async function countEnquiries() {
  await connectDB();
  return EnquiryModel.countDocuments();
}
