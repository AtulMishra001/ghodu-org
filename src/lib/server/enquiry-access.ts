import "server-only";
import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";

// Second lock on the Enquiries tab, on top of the admin login: an access code
// from the env, which has to be entered again after an hour.

export const ACCESS_COOKIE = "ghodu_enquiry_access";
/** Only sent to the Enquiries tab. */
export const ACCESS_PATH = "/admin/enquiries";
export const ACCESS_SECONDS = 60 * 60;

const AUDIENCE = "ghodu-enquiries";
const ISSUER = "ghodu-agro";
const key = () => new TextEncoder().encode(env("JWT_SECRET"));

// Changing the code signs out anyone who unlocked with the old one.
const codeVersion = () => createHash("sha256").update(env("ENQUIRY_ACCESS_CODE")).digest("base64url").slice(0, 16);

export function signEnquiryAccess() {
  return new SignJWT({ cv: codeVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("enquiries")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_SECONDS}s`)
    .sign(key());
}

/** When the current access ends (ms since epoch), or null if the tab is locked. */
export async function getEnquiryAccess() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] });
    if (payload.sub !== "enquiries" || payload.cv !== codeVersion() || !payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}
