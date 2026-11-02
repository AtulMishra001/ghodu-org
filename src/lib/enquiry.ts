import { site } from "@/data/site";

export type EnquiryUnit = "kg" | "t";
export type EnquiryLine = { name: string; form: string; qty?: number; unit?: EnquiryUnit };

/** Every form on the site that sends an enquiry, with its label in the admin. */
export const ENQUIRY_FORMS = {
  contact: "Contact page",
  bulk: "Bulk enquiry",
  product: "Product page",
  blog: "Blog article",
} as const;
export type EnquiryFormId = keyof typeof ENQUIRY_FORMS;

/** The plain-text enquiry sent over WhatsApp or email. */
export function enquiryMessage(lines: EnquiryLine[], data: FormData, subject = "Enquiry") {
  return [
    `${subject} for ${site.name}`,
    "",
    ...lines.map((l) => `• ${l.name} (${l.form})${l.qty ? ` — ${l.qty} ${l.unit === "t" ? "tonnes" : "kg"}` : ""}`),
    "",
    data.get("company") ? `Company: ${data.get("company")}` : "",
    data.get("name") ? `Name: ${data.get("name")}` : "",
    data.get("contact") ? `Contact: ${data.get("contact")}` : "",
    // Forms without a delivery field leave this line out entirely.
    data.has("city") ? `Deliver to: ${data.get("city") || "—"}` : "",
    data.get("notes") ? `Notes: ${data.get("notes")}` : "",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n")
    .trim();
}

/**
 * A link that opens the same message in WhatsApp or email, offered after an
 * enquiry is saved. It's a real link rather than window.open, because browsers
 * block pop-ups that open after waiting for a server response.
 */
export function enquiryHandoff(message: string) {
  if (site.whatsapp) return { label: "Also send on WhatsApp", href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}` };
  if (site.email) return { label: "Also send by email", href: `mailto:${site.email}?subject=${encodeURIComponent("Bulk enquiry")}&body=${encodeURIComponent(message)}` };
  return null;
}

/** The fields every form sends to /api/enquiries. */
export type EnquiryPayload = {
  form: EnquiryFormId;
  subject?: string;
  company?: string;
  name: string;
  contact: string;
  city?: string;
  message?: string;
  items?: EnquiryLine[];
  source: string;
  /** The hidden trap field and how long the form was open: see EnquiryTrap. */
  website: string;
  fillMs: number;
};

/** Saves an enquiry. Throws with a message that's safe to show the visitor. */
export async function sendEnquiry(payload: EnquiryPayload) {
  let res: Response;
  try {
    res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, pageUrl: window.location.href }),
    });
  } catch {
    throw new Error("We couldn't send your enquiry. Check your connection and try again.");
  }
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? "We couldn't send your enquiry. Please try again.");
}
