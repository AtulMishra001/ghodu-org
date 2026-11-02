"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/server/env";
import { SESSION_COOKIE, SESSION_HOURS, SESSION_PATH, signSession } from "@/lib/server/session";

export type LoginState = { error?: string; email?: string };

// Constant-time comparison of two strings of any length.
const same = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

// Simple in-memory throttle: 5 failed tries per address per 15 minutes.
// Per server instance only — enough to blunt guessing on a single-admin login.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const g = globalThis as typeof globalThis & { _loginFails?: Map<string, { count: number; first: number }> };
const fails = (g._loginFails ??= new Map());

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  const ok = (next === "/admin" || next.startsWith("/admin/")) && !next.startsWith("/admin/login");
  return ok ? next : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const record = fails.get(ip);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_FAILS) {
    const minutes = Math.ceil((WINDOW_MS - (now - record.first)) / 60000);
    return { email, error: `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  if (!email || !password) return { email, error: "Enter your email and password." };

  const ok = same(email.toLowerCase(), env("ADMIN_EMAIL").toLowerCase()) && same(password, env("ADMIN_PASSWORD"));
  if (!ok) {
    const fresh = !record || now - record.first >= WINDOW_MS;
    fails.set(ip, fresh ? { count: 1, first: now } : { count: record.count + 1, first: record.first });
    await new Promise((r) => setTimeout(r, 500)); // slows scripted guessing
    return { email, error: "That email and password don't match." };
  }

  fails.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await signSession(env("ADMIN_EMAIL")), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SESSION_PATH,
    maxAge: SESSION_HOURS * 60 * 60,
  });
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  (await cookies()).set(SESSION_COOKIE, "", { path: SESSION_PATH, maxAge: 0 });
  redirect("/admin/login");
}
