import "server-only";

type Key =
  | "MONGODB_URI"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_API_KEY"
  | "CLOUDINARY_API_SECRET"
  | "ADMIN_EMAIL"
  | "ADMIN_PASSWORD"
  | "JWT_SECRET"
  | "ENQUIRY_ACCESS_CODE";

/** Reads a required server env var, failing loudly (server-side only) when it's missing. */
export function env(key: Key) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing environment variable ${key} — add it to .env.local`);
  return value;
}
