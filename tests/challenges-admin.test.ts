import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseChallengeForm,
  parseEventForm,
} from "../src/lib/challenges/admin-forms";
import { parseTashkent, tashkentInput } from "../src/lib/challenges/scoring";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};
const event = {
  slug: "kuz-2026",
  title: "Kuzgi CTF",
  startsAt: "2026-11-10T10:00",
  endsAt: "2026-11-10T18:00",
  maxTeamSize: "4",
  allowSolo: "on",
};

test("Tashkent times round-trip through the datetime-local field", () => {
  const date = parseTashkent("2026-11-10T10:00")!;
  assert.equal(date.toISOString(), "2026-11-10T05:00:00.000Z");
  assert.equal(tashkentInput(date), "2026-11-10T10:00");
  assert.equal(parseTashkent("10/11/2026"), null);
});

test("an event form needs a free address, a title and an order of times", () => {
  const ok = parseEventForm(form(event));
  assert.ok("data" in ok);
  assert.equal(ok.data.allowSolo, true);
  assert.equal(ok.data.published, false);
  assert.equal(ok.data.registrationEndsAt, null);
  for (const [field, value] of [
    ["slug", "login"],
    ["slug", "Kuz 2026"],
    ["title", "ab"],
    ["endsAt", "2026-11-10T09:00"],
    ["maxTeamSize", "11"],
    ["freezeAt", "2026-11-10T19:00"],
    ["registrationEndsAt", "2026-11-11T10:00"],
  ])
    assert.ok(
      "error" in parseEventForm(form({ ...event, [field]: value })),
      `${field}=${value}`,
    );
});

test("a challenge form validates points and needs a flag on creation", () => {
  const challenge = {
    title: "Base64 xat",
    category: "Crypto",
    initialPoints: "500",
    minimumPoints: "100",
    decay: "20",
    visible: "on",
  };
  assert.ok("error" in parseChallengeForm(form(challenge), true));
  const created = parseChallengeForm(
    form({ ...challenge, flag: " CV{x} " }),
    true,
  );
  assert.ok("data" in created);
  assert.equal(created.data.flag, "CV{x}");
  assert.equal(created.data.caseSensitive, true);
  const edited = parseChallengeForm(
    form({ ...challenge, caseInsensitive: "on" }),
    false,
  );
  assert.ok("data" in edited);
  assert.equal(edited.data.flag, null);
  assert.equal(edited.data.caseSensitive, false);
  for (const [field, value] of [
    ["category", "Hacking"],
    ["minimumPoints", "600"],
    ["decay", "0"],
    ["initialPoints", "-5"],
  ])
    assert.ok(
      "error" in
        parseChallengeForm(
          form({ ...challenge, flag: "x", [field]: value }),
          true,
        ),
      field,
    );
});
