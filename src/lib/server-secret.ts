import "server-only";
import { createHash } from "node:crypto";

// A signing key for one purpose: from AUTH_SECRET when set, otherwise derived
// from the database URL, which is just as private and present wherever data
// can be saved. Null in production without either.
export function serverSecret(purpose: string) {
  const value = process.env.AUTH_SECRET || process.env.DATABASE_URL;
  if (value)
    return createHash("sha256").update(`${purpose}:${value}`).digest("hex");
  return process.env.NODE_ENV === "production" ? null : `dev-${purpose}-secret`;
}
