"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { requireAdmin } from "@/lib/server/auth";
import { ACCESS_COOKIE, ACCESS_PATH, ACCESS_SECONDS, signEnquiryAccess } from "@/lib/server/enquiry-access";
import { env } from "@/lib/server/env";

export type UnlockState = { error?: string };

const same = (a: string, b: string) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

// 5 wrong codes per address per 15 minutes, per server instance, as on the login.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const g = globalThis as typeof globalThis & { _enquiryCodeFails?: Map<string, { count: number; first: number }> };
const fails = (g._enquiryCodeFails ??= new Map());

export async function unlockEnquiries(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const record = fails.get(ip);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_FAILS) {
    const minutes = Math.ceil((WINDOW_MS - (now - record.first)) / 60000);
    return { error: `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }
  if (!code) return { error: "Enter the access code." };

  if (!same(code, env("ENQUIRY_ACCESS_CODE"))) {
    const fresh = !record || now - record.first >= WINDOW_MS;
    fails.set(ip, fresh ? { count: 1, first: now } : { count: record.count + 1, first: record.first });
    await new Promise((r) => setTimeout(r, 500)); // slows scripted guessing
    return { error: "That code isn't right." };
  }

  fails.delete(ip);
  (await cookies()).set(ACCESS_COOKIE, await signEnquiryAccess(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ACCESS_PATH,
    maxAge: ACCESS_SECONDS,
  });
  return {};
}

export async function lockEnquiries() {
  await requireAdmin();
  (await cookies()).set(ACCESS_COOKIE, "", { path: ACCESS_PATH, maxAge: 0 });
}
