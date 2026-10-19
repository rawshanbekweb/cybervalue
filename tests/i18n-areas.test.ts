import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

// Browser components only get the dictionaries of their area (see
// components/i18n). Every literal t("…") in a client file must be found in
// one of its area's dictionaries, or the text shows untranslated.
const DIR = "src/lib/i18n";
const dictionaries = new Map<string, Set<string>>();
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const name = basename(file, ".json");
  const messages = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  for (const [en, uz] of Object.entries<string>(messages))
    for (const key of [en, uz]) {
      if (!dictionaries.has(key)) dictionaries.set(key, new Set());
      dictionaries.get(key)!.add(name);
    }
}

function layer(file: string) {
  const text = readFileSync(`src/components/i18n/${file}-messages.tsx`, "utf8");
  return new Set(
    [...text.matchAll(/@\/lib\/i18n\/([a-z-]+)\.json/g)].map((m) => m[1]),
  );
}
const with_ = (names: Set<string>) => new Set(["messages", ...names]);
const AREAS: Record<string, Set<string>> = {
  common: new Set(["messages"]),
  admin: with_(layer("admin")),
  student: with_(layer("student")),
  junior: with_(layer("junior")),
  kids: with_(layer("kids")),
  live: with_(layer("live")),
  lab: with_(layer("lab")),
};

function area(file: string) {
  if (/components\/admin\/|app\/admin\//.test(file)) return "admin";
  if (file.includes("playground/junior/")) return "junior";
  if (file.includes("components/kids/")) return "kids";
  if (file.includes("components/live/")) return "live";
  if (/components\/student\/|app\/student\/|portrait-upload/.test(file))
    return "student";
  if (/playground\/|resource-exam\//.test(file)) return "lab";
  return "common";
}

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.tsx?$/.test(entry)) yield path;
  }
}

test("client text is in its area's dictionaries", () => {
  const literal = /\bt\(\s*(["`])((?:\\.|(?!\1).)*?)\1/gs;
  const missing: string[] = [];
  for (const file of files("src")) {
    const source = readFileSync(file, "utf8");
    if (!source.includes('"use client"')) continue;
    const allowed = AREAS[area(file)];
    for (const match of source.matchAll(literal)) {
      const key = match[2].replaceAll('\\"', '"');
      const homes = dictionaries.get(key);
      if (homes && ![...homes].some((h) => allowed.has(h)))
        missing.push(`${file}: "${key}" is only in ${[...homes].join(", ")}`);
    }
  }
  assert.deepEqual(missing, []);
});

// Server actions return messages that the area's forms pass to t().
const ACTIONS: Record<string, string> = {
  "src/app/[lang]/kids/actions.ts": "kids",
  "src/app/[lang]/junior/actions.ts": "junior",
  "src/app/student/actions.ts": "student",
};

test("messages returned by an area's server actions are in its dictionaries", () => {
  const missing: string[] = [];
  for (const [file, name] of Object.entries(ACTIONS)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/"([A-Z][^"]{8,})"/g)) {
      const homes = dictionaries.get(match[1]);
      if (homes && ![...homes].some((h) => AREAS[name].has(h)))
        missing.push(`${file}: "${match[1]}"`);
    }
  }
  assert.deepEqual(missing, []);
});
