import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// A personal lab: the admin writes an artifact template (a log, a page, a
// config...) and every student downloads their own copy with their own flag.
// Flags and variants are derived from the material's secret with HMAC, so
// nothing per-student is stored and one student's flag is useless to another.
//
// Placeholders:
//   {{flag}}            the student's flag, e.g. CV{3f9a...}
//   {{flag:ENCODING}}   the flag encoded: base64, hex, rot13, reverse, url
//   {{decoy}}           a flag-shaped fake, different at each position
//   {{decoy:ENCODING}}  a fake encoded the same way, so decoding every string
//                       in the file is not enough to find the real flag
//   {{name}}            the student's name
// A line "=== variant ===" separates alternative versions of the artifact.

export const ENCODINGS = ["base64", "hex", "rot13", "reverse", "url"] as const;
type Encoding = (typeof ENCODINGS)[number];
export const MAX_ARTIFACT = 200_000;
const PLACEHOLDER = /\{\{\s*([a-z]+)(?::([a-z0-9]+))?\s*\}\}/gi;
const VARIANT_SPLIT = /^[ \t]*===[ \t]*variant[ \t]*===[ \t]*$/im;

export const newChallengeSecret = () => randomBytes(32).toString("base64url");

const digest = (secret: string, label: string) =>
  createHmac("sha256", secret).update(label).digest("hex");

export const flagFor = (secret: string, studentId: string) =>
  `CV{${digest(secret, `flag:${studentId}`).slice(0, 24)}}`;

const decoyFor = (secret: string, studentId: string, index: number) =>
  `CV{${digest(secret, `decoy:${studentId}:${index}`).slice(0, 24)}}`;

export function splitVariants(template: string) {
  return template
    .split(VARIANT_SPLIT)
    .map((part) => part.replace(/^\r?\n|\r?\n$/g, ""))
    .filter((part) => part.trim());
}

export function variantFor(secret: string, studentId: string, count: number) {
  return (
    parseInt(digest(secret, `variant:${studentId}`).slice(0, 8), 16) % count
  );
}

function encode(flag: string, encoding: Encoding) {
  switch (encoding) {
    case "base64":
      return Buffer.from(flag).toString("base64");
    case "hex":
      return Buffer.from(flag).toString("hex");
    case "rot13":
      return flag.replace(/[a-z]/gi, (c) => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    case "reverse":
      return [...flag].reverse().join("");
    case "url":
      return [...Buffer.from(flag)]
        .map((b) => `%${b.toString(16).padStart(2, "0")}`)
        .join("");
  }
}

// Errors are translation keys; `number` is the 1-based variant. The value
// is called `token` because `{{name}}` in the text must stay literal.
export function checkArtifact(
  template: string,
): { error: string; values?: { number?: number; token?: string } } | null {
  if (template.length > MAX_ARTIFACT)
    return { error: "The artifact is too long (up to 200,000 characters)." };
  const variants = splitVariants(template);
  if (!variants.length) return { error: "Write the artifact template." };
  if (variants.length > 20) return { error: "Use at most 20 variants." };
  for (const [i, variant] of variants.entries()) {
    let flags = 0;
    for (const [, name, option] of variant.matchAll(PLACEHOLDER)) {
      const key = name.toLowerCase();
      if (key === "flag" || key === "decoy") {
        if (option && !ENCODINGS.includes(option.toLowerCase() as Encoding))
          return {
            error:
              "Unknown encoding “{token}”. Use base64, hex, rot13, reverse or url.",
            values: { token: option },
          };
        if (key === "flag") flags++;
      } else if (key !== "name" || option)
        return {
          error:
            "Unknown placeholder “{token}”. Use {{flag}}, {{flag:base64}}, {{decoy}} or {{name}}.",
          values: { token: option ? `${name}:${option}` : name },
        };
    }
    if (!flags)
      return {
        error: "Variant {number} has no {{flag}} placeholder.",
        values: { number: i + 1 },
      };
  }
  return null;
}

export function renderArtifact(
  template: string,
  secret: string,
  student: { id: string; name: string },
) {
  const variants = splitVariants(template);
  const variant = variantFor(secret, student.id, variants.length);
  const flag = flagFor(secret, student.id);
  let decoys = 0;
  const text = variants[variant].replace(
    PLACEHOLDER,
    (_, name: string, option?: string) => {
      const key = name.toLowerCase();
      const value =
        key === "flag"
          ? flag
          : key === "decoy"
            ? decoyFor(secret, student.id, decoys++)
            : null;
      if (value === null) return student.name;
      return option ? encode(value, option.toLowerCase() as Encoding) : value;
    },
  );
  return { text, variant: variant + 1, variants: variants.length };
}

// The debrief a student sees after a lab: one shared text, or one part per
// artifact variant ("=== variant ===") so it matches the file they received.
export function explanationFor(
  material: { explanation: string; artifact: string; secret: string | null },
  studentId: string,
) {
  const parts = splitVariants(material.explanation);
  if (parts.length < 2) return material.explanation.trim();
  const count = splitVariants(material.artifact).length;
  if (!material.secret || parts.length !== count) return "";
  return parts[variantFor(material.secret, studentId, count)].trim();
}

export const normalizeFlag = (input: string) => input.trim().slice(0, 200);

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type FlagVerdict =
  | { result: "correct" }
  | { result: "wrong" }
  | { result: "decoy" }
  | { result: "shared"; owner: string };

// Besides the student's own flag, recognise decoys from their artifact and
// flags that belong to classmates, so the teacher can see shared answers.
export function judgeFlag(
  input: string,
  template: string,
  secret: string,
  student: { id: string; name: string },
  classmates: string[],
): FlagVerdict {
  const flag = normalizeFlag(input);
  if (same(flag, flagFor(secret, student.id))) return { result: "correct" };
  if (!/^CV\{[a-f0-9]{24}\}$/.test(flag)) return { result: "wrong" };
  const variants = splitVariants(template);
  const variant = variants[variantFor(secret, student.id, variants.length)];
  const decoys = [...(variant ?? "").matchAll(PLACEHOLDER)].filter(
    ([, name]) => name.toLowerCase() === "decoy",
  ).length;
  for (let i = 0; i < decoys; i++)
    if (same(flag, decoyFor(secret, student.id, i))) return { result: "decoy" };
  const owner = classmates.find(
    (id) => id !== student.id && same(flag, flagFor(secret, id)),
  );
  return owner ? { result: "shared", owner } : { result: "wrong" };
}

export const artifactNamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
