import type { AdminProduct } from "@/lib/server/products";

/** What's missing from a product's page, in the order a buyer would notice it. */
export function gaps(p: AdminProduct) {
  const missing: string[] = [];
  if (!p.published) missing.push("Hidden");
  if (!p.coverImage) missing.push("Cover photo");
  if (!p.ordering.moq) missing.push("MOQ");
  if (p.ordering.packaging.length === 0) missing.push("Packing");
  if (!p.ordering.leadTimeDays) missing.push("Lead time");
  if (!p.ordering.paymentTerms) missing.push("Payment terms");
  if (p.specs.length === 0) missing.push("Specifications");
  if (!p.description) missing.push("Description");
  if (p.gallery.length === 0) missing.push("Gallery photos");
  return missing;
}
