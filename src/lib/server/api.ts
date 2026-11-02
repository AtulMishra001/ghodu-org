import "server-only";
import { NextResponse } from "next/server";
import { getAdmin } from "./auth";
import { BlogWriteError } from "./blogs";

const NO_STORE = { "Cache-Control": "no-store" };

export const jsonOk = (body: object, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });
export const jsonError = (error: string, status: number) => NextResponse.json({ success: false, error, message: error }, { status, headers: NO_STORE });

/** Page protection isn't enough: every admin API calls this and returns the 401 itself. */
export async function unauthorized() {
  return (await getAdmin()) ? null : jsonError("Please sign in again.", 401);
}

export async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

export function blogFailure(err: unknown, action: string) {
  if (err instanceof BlogWriteError) return jsonError(err.message, err.status);
  console.error(`[blogs] ${action}`, err);
  return jsonError("Something went wrong on the server. Try again.", 500);
}
