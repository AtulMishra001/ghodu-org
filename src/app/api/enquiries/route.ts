import { headers } from "next/headers";
import { jsonError, jsonOk, readJson } from "@/lib/server/api";
import { parseEnquiry, saveEnquiry } from "@/lib/server/enquiries";

// Every enquiry form on the site posts here. Reading them happens only inside
// the admin's Enquiries page, behind the login and the access code.
//
// Bot protection: a hidden field people never fill in, a minimum time the form
// has to be open, and a per-address limit. The limit is per server instance,
// which is enough to blunt scripted floods.
const MIN_FILL_MS = 1500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const g = globalThis as typeof globalThis & { _enquiryHits?: Map<string, number[]> };
const hits = (g._enquiryHits ??= new Map());

export async function POST(request: Request) {
  const parsed = await readJson(request);
  if (!parsed.ok || !parsed.body || typeof parsed.body !== "object") return jsonError("Invalid enquiry.", 400);
  const body = parsed.body as Record<string, unknown>;

  // Looks like success, so a bot learns nothing, but nothing is stored.
  if ((typeof body.website === "string" && body.website.trim()) || !(Number(body.fillMs) >= MIN_FILL_MS)) return jsonOk({ success: true });

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t: number) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return jsonError("Too many enquiries from this connection. Please try again in a few minutes.", 429);

  const enquiry = parseEnquiry(body);
  if ("error" in enquiry) return jsonError(enquiry.error, 400);

  try {
    await saveEnquiry(enquiry.data);
  } catch (err) {
    console.error("[enquiries] save failed", err);
    return jsonError("We couldn't send your enquiry. Please try again.", 500);
  }
  hits.set(ip, [...recent, now]);
  return jsonOk({ success: true }, 201);
}
