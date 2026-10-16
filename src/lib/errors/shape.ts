// How an error is stored: secrets in paths are masked, long text is cut and
// repeats of the same error share one fingerprint.
import { createHash } from "node:crypto";

export type ErrorInput = {
  source: "server" | "client";
  message: string;
  digest?: string;
  path?: string;
  route?: string;
  stack?: string;
};

/** Drops the query and masks tokens and ids (report links, codes). */
export function maskPath(path: string) {
  const clean = path.split(/[?#]/)[0].slice(0, 300);
  return clean
    .split("/")
    .map((part) => (/^[A-Za-z0-9_-]{16,}$/.test(part) ? ":id" : part))
    .join("/");
}

export function shapeError(input: ErrorInput) {
  const message = (input.message || "Unknown error").slice(0, 1000);
  const route = (input.route ?? "").slice(0, 200);
  const path = maskPath(input.path ?? "");
  const fingerprint = createHash("sha256")
    .update(
      `${input.source}|${route || path}|${message
        // Numbers and ids change between repeats of the same error.
        .replace(/\b[0-9a-f]{8,}\b/gi, "#")
        .replace(/\d+/g, "#")
        .slice(0, 300)}`,
    )
    .digest("hex")
    .slice(0, 40);
  return {
    fingerprint,
    source: input.source,
    message,
    digest: (input.digest ?? "").slice(0, 100),
    path,
    route,
    stack: (input.stack ?? "").slice(0, 4000),
  };
}
