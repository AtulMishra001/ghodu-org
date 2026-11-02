import { ClockIcon, PackageIcon, ScalesIcon, TruckIcon, type Icon } from "@phosphor-icons/react";
import { formatLeadTime, formatQuantity } from "@/data/ordering";
import type { Product } from "@/data/products";
import { site } from "@/data/site";

export const ON_REQUEST = "On request";

// The four things a buyer checks first. Blank fields read "On request".
export function keyFacts(product: Product): { icon: Icon; label: string; value: string }[] {
  const o = product.ordering;
  return [
    { icon: ScalesIcon, label: "Minimum order", value: o?.moq ? formatQuantity(o.moq) : ON_REQUEST },
    { icon: ClockIcon, label: "Dispatch", value: o?.leadTimeDays ? formatLeadTime(o.leadTimeDays) : ON_REQUEST },
    {
      icon: PackageIcon,
      label: "Packing",
      value: o?.packaging.length ? `${formatQuantity(o.packaging[0].size)}${o.packaging.length > 1 ? ` +${o.packaging.length - 1} more` : ""}` : ON_REQUEST,
    },
    { icon: TruckIcon, label: "Delivers to", value: o?.deliveryRegions.length ? o.deliveryRegions.join(", ") : ON_REQUEST },
  ];
}

/** Null until a WhatsApp number is configured. */
export function whatsappLink(product: Product) {
  return site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hello ${site.name}, I'd like to know more about your ${product.name}.`)}`
    : null;
}
