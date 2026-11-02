import { monthNames } from "@/data/site";

/** "September – October" from a list of harvest months (0 = January). */
export function seasonLabel(harvest: number[]) {
  const first = monthNames[harvest[0]];
  const last = monthNames[harvest[harvest.length - 1]];
  return harvest.length === 1 ? first : `${first} – ${last}`;
}
