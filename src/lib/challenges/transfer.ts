// Moving a competition in and out as JSON: an owner exports one to keep or
// to reuse elsewhere, or writes a challenge set by hand and imports it.
// Files are not carried (they are uploaded on each challenge page).
import { z } from "zod";
import {
  CATEGORIES,
  parseTashkent,
  storeFlag,
  type StoredFlag,
} from "./scoring";

export const TRANSFER_VERSION = 1;

// A time as ISO 8601 (an export) or "YYYY-MM-DDTHH:mm" in Tashkent time (by hand).
const time = z
  .string()
  .max(40)
  .transform((value, ctx) => {
    const date = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
      ? parseTashkent(value)
      : new Date(value);
    if (!date || Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid time" });
      return z.NEVER;
    }
    return date;
  });

// A flag is either typed out ("flag") or carried as an exported digest.
const flag = z.union([
  z.object({
    flag: z.string().trim().min(1).max(200),
    caseSensitive: z.boolean().default(true),
  }),
  z.object({
    salt: z.string().regex(/^[0-9a-f]{32}$/),
    hash: z.string().regex(/^[0-9a-f]{64}$/),
    caseSensitive: z.boolean().default(true),
  }),
]);

const challenge = z.object({
  // Names the challenge inside the file, for "requires".
  key: z.string().min(1).max(60),
  title: z.string().trim().min(2).max(100),
  category: z.enum(CATEGORIES),
  description: z.string().max(20000).default(""),
  releaseAt: time.nullable().default(null),
  requires: z.string().max(60).nullable().default(null),
  maxAttempts: z.number().int().min(0).max(1000).default(0),
  initialPoints: z.number().int().min(0).max(10000).default(500),
  minimumPoints: z.number().int().min(0).max(10000).default(100),
  decay: z.number().int().min(1).max(1000).default(20),
  visible: z.boolean().default(true),
  position: z.number().int().min(-10000).max(10000).default(0),
  flags: z.array(flag).min(1).max(20),
  hints: z
    .array(
      z.object({
        text: z.string().trim().min(2).max(4000),
        cost: z.number().int().min(0).max(10000).default(0),
      }),
    )
    .max(20)
    .default([]),
});

export const transferSchema = z.object({
  version: z.literal(TRANSFER_VERSION),
  event: z.object({
    slug: z.string().max(60),
    title: z.string().trim().min(3).max(120),
    summary: z.string().max(300).default(""),
    description: z.string().max(20000).default(""),
    startsAt: time,
    endsAt: time,
    registrationEndsAt: time.nullable().default(null),
    freezeAt: time.nullable().default(null),
    maxTeamSize: z.number().int().min(1).max(10).default(4),
    allowSolo: z.boolean().default(true),
  }),
  challenges: z.array(challenge).max(300),
});

export type Transfer = z.infer<typeof transferSchema>;

/**
 * Checks a parsed file beyond its shape: times in order, unique keys,
 * prerequisites that exist and never loop. Returns a message or null.
 */
export function transferProblem(data: Transfer): string | null {
  const { event, challenges } = data;
  if (event.endsAt <= event.startsAt)
    return "The end must come after the start.";
  const keys = new Set<string>();
  for (const c of challenges) {
    if (keys.has(c.key)) return `Two challenges use the key "${c.key}".`;
    keys.add(c.key);
    if (c.minimumPoints > c.initialPoints)
      return `${c.title}: the minimum is above the starting value.`;
  }
  const requires = new Map(challenges.map((c) => [c.key, c.requires]));
  for (const c of challenges) {
    if (c.requires && !keys.has(c.requires))
      return `${c.title}: it requires "${c.requires}", which is not in the file.`;
    let current = c.requires;
    for (let step = 0; current; step++) {
      if (current === c.key || step > challenges.length)
        return `${c.title}: the "requires" chain loops.`;
      current = requires.get(current) ?? null;
    }
  }
  return null;
}

/** The stored form of an imported flag: typed flags are salted and hashed. */
export function importFlag(
  f: Transfer["challenges"][number]["flags"][number],
): StoredFlag {
  return "flag" in f
    ? storeFlag(f.flag, f.caseSensitive)
    : { salt: f.salt, hash: f.hash, caseSensitive: f.caseSensitive };
}
