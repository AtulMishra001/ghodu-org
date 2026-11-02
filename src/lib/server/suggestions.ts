import "server-only";
import { products as starter } from "@/data/products";
import type { AdminProduct } from "./products";

/** Autocomplete options for the product form, from what's already in use. */
export function suggestionsFrom(all: AdminProduct[]) {
  const source = [...all, ...starter];
  return {
    kinds: [...new Set(source.map((p) => p.kind))].sort(),
    forms: [...new Set(source.flatMap((p) => p.forms))].sort(),
  };
}
