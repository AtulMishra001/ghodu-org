import "server-only";
import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { env } from "./env";

// Signed JWT kept in an httpOnly cookie. Kept free of next/headers so the
// proxy can verify it too.

// Renamed when the path below widened: a cookie left over from the old
// /admin-only path could otherwise outlive a sign-out.
export const SESSION_COOKIE = "ghodu_admin_session";
export const SESSION_HOURS = 12;
/** Sent site-wide because the admin APIs under /api check it too. It's httpOnly, and public pages never read it. */
export const SESSION_PATH = "/";

const ISSUER = "ghodu-agro";
const AUDIENCE = "ghodu-admin";

const key = () => new TextEncoder().encode(env("JWT_SECRET"));

// Fingerprint of the current credentials: changing the admin email or
// password in the env signs every existing session out.
const credentialVersion = () =>
  createHash("sha256").update(`${env("ADMIN_EMAIL").toLowerCase()}:${env("ADMIN_PASSWORD")}`).digest("base64url").slice(0, 16);

export type AdminSession = { email: string };

export async function signSession(email: string) {
  return new SignJWT({ email, cv: credentialVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] });
    if (payload.sub !== "admin" || payload.cv !== credentialVersion() || typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
