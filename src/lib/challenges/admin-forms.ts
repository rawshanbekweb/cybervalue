// Validation of the CTF admin forms. Pure, so the unit tests cover it.
import { z } from "zod";
import {
  CATEGORIES,
  parseTashkent,
  RESERVED_SLUGS,
  slugPattern,
} from "./scoring";

const get = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};
const optionalTime = (value: string) =>
  value.trim() ? parseTashkent(value.trim()) : null;

export type EventInput = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  registrationEndsAt: Date | null;
  freezeAt: Date | null;
  maxTeamSize: number;
  allowSolo: boolean;
  published: boolean;
};

/** An event form: either the input or a message for the admin. */
export function parseEventForm(
  form: FormData,
): { data: EventInput } | { error: string } {
  const slug = get(form, "slug").trim().toLowerCase();
  if (!slugPattern.test(slug) || RESERVED_SLUGS.has(slug))
    return {
      error:
        "Address: 3–60 lower-case Latin letters, digits and dashes, not a reserved word.",
    };
  const title = get(form, "title").trim();
  if (title.length < 3 || title.length > 120)
    return { error: "Title: 3 to 120 characters." };
  const startsAt = parseTashkent(get(form, "startsAt"));
  const endsAt = parseTashkent(get(form, "endsAt"));
  if (!startsAt || !endsAt || endsAt <= startsAt)
    return { error: "Set a start and an end after it." };
  const registrationEndsAt = optionalTime(get(form, "registrationEndsAt"));
  const freezeAt = optionalTime(get(form, "freezeAt"));
  if (registrationEndsAt && registrationEndsAt > endsAt)
    return { error: "Registration must close before the end." };
  if (freezeAt && (freezeAt <= startsAt || freezeAt >= endsAt))
    return { error: "The freeze must fall between the start and the end." };
  const maxTeamSize = Number(get(form, "maxTeamSize"));
  if (!Number.isInteger(maxTeamSize) || maxTeamSize < 1 || maxTeamSize > 10)
    return { error: "Team size: 1 to 10." };
  return {
    data: {
      slug,
      title,
      summary: get(form, "summary").trim().slice(0, 300),
      description: get(form, "description").trim().slice(0, 20000),
      startsAt,
      endsAt,
      registrationEndsAt,
      freezeAt,
      maxTeamSize,
      allowSolo: form.get("allowSolo") === "on",
      published: form.get("published") === "on",
    },
  };
}

const points = z.coerce.number().int().min(0).max(10000);

export type ChallengeInput = {
  title: string;
  category: string;
  description: string;
  caseSensitive: boolean;
  initialPoints: number;
  minimumPoints: number;
  decay: number;
  visible: boolean;
  position: number;
  flag: string | null;
};

/** A challenge form. The flag is required on creation, optional on edit. */
export function parseChallengeForm(
  form: FormData,
  requireFlag: boolean,
): { data: ChallengeInput } | { error: string } {
  const title = get(form, "title").trim();
  if (title.length < 2 || title.length > 100)
    return { error: "Title: 2 to 100 characters." };
  const category = get(form, "category");
  if (!(CATEGORIES as readonly string[]).includes(category))
    return { error: "Choose a category." };
  const initial = points.safeParse(get(form, "initialPoints"));
  const minimum = points.safeParse(get(form, "minimumPoints"));
  const decay = z.coerce
    .number()
    .int()
    .min(1)
    .max(1000)
    .safeParse(get(form, "decay"));
  if (!initial.success || !minimum.success || !decay.success)
    return { error: "Points: whole numbers; decay from 1 to 1000." };
  if (minimum.data > initial.data)
    return { error: "The minimum cannot be above the starting value." };
  const flag = get(form, "flag").trim();
  if (requireFlag && !flag) return { error: "Set the flag." };
  if (flag.length > 200)
    return { error: "The flag is too long (200 at most)." };
  const position = Number(get(form, "position") || 0);
  return {
    data: {
      title,
      category,
      description: get(form, "description").trim().slice(0, 20000),
      caseSensitive: form.get("caseInsensitive") !== "on",
      initialPoints: initial.data,
      minimumPoints: minimum.data,
      decay: decay.data,
      visible: form.get("visible") === "on",
      position: Number.isInteger(position) ? position : 0,
      flag: flag || null,
    },
  };
}
