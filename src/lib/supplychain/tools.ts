// Academy Intermediate · Dependencies and supply chain: a small app's
// lockfile checked against an advisory list by version range, and six
// install commands to sort into real packages and look-alikes. The
// advisories are simplified, but the packages and the kinds of flaw are
// real ones.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Versions --------------------------------------------------------------------------

export type Version = [number, number, number];

export const parse = (v: string): Version => {
  const [a = 0, b = 0, c = 0] = v.split(".").map(Number);
  return [a, b, c];
};

/** Negative when a is older than b. */
export const compare = (a: string, b: string) => {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

// --- Audit -----------------------------------------------------------------------------

export type Dep = { name: string; version: string; direct: boolean };

/** What the lockfile resolved, direct and transitive. */
export const LOCK: Dep[] = [
  { name: "express", version: "4.21.2", direct: true },
  { name: "lodash", version: "4.17.15", direct: true },
  { name: "jsonwebtoken", version: "8.5.1", direct: true },
  { name: "axios", version: "1.7.9", direct: true },
  { name: "minimist", version: "1.2.5", direct: false },
  { name: "qs", version: "6.13.0", direct: false },
];

export type Advisory = {
  name: string;
  /** Versions below this are affected. */
  fixed: string;
  issue: Text;
};

export const ADVISORIES: Advisory[] = [
  {
    name: "lodash",
    fixed: "4.17.21",
    issue: t("Buyruq kiritish (template)", "Command injection (template)"),
  },
  {
    name: "jsonwebtoken",
    fixed: "9.0.0",
    issue: t(
      "Zaif kalitlar bilan imzo tekshiruvini chetlab o‘tish",
      "Signature checks bypassed with weak keys",
    ),
  },
  {
    name: "minimist",
    fixed: "1.2.6",
    issue: t("Prototype pollution", "Prototype pollution"),
  },
  {
    name: "express",
    fixed: "4.20.0",
    issue: t("res.redirect() orqali XSS", "XSS through res.redirect()"),
  },
  {
    name: "axios",
    fixed: "1.6.0",
    issue: t("CSRF tokenining sizishi", "CSRF token leak"),
  },
];

export const advisoryFor = (d: Dep) =>
  ADVISORIES.find((a) => a.name === d.name && compare(d.version, a.fixed) < 0);

export const VULNERABLE = LOCK.filter((d) => advisoryFor(d)).map((d) => d.name);

export const auditRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === VULNERABLE.length && VULNERABLE.every((n) => set.has(n));
};

// --- Look-alike packages ---------------------------------------------------------------

export type Install = { cmd: string; fake: boolean; why: Text };

export const INSTALLS: Install[] = [
  {
    cmd: "npm install express",
    fake: false,
    why: t("Haqiqiy paket.", "The real package."),
  },
  {
    cmd: "npm install expresss",
    fake: true,
    why: t(
      "Ortiqcha “s” — yozuv xatosini kutgan nusxa.",
      "An extra “s”: a typo trap.",
    ),
  },
  {
    cmd: "npm install crossenv",
    fake: true,
    why: t(
      "Haqiqiysi cross-env. 2017-yilda crossenv muhit o‘zgaruvchilarini o‘g‘irlagan.",
      "The real one is cross-env. In 2017 crossenv stole environment variables.",
    ),
  },
  {
    cmd: "npm install @types/node",
    fake: false,
    why: t(
      "Rasmiy @types doirasidagi paket.",
      "A package in the official @types scope.",
    ),
  },
  {
    cmd: "pip install reqeusts",
    fake: true,
    why: t("Harflar o‘rni almashgan: requests.", "Letters swapped: requests."),
  },
  {
    cmd: "pip install requests",
    fake: false,
    why: t("Haqiqiy paket.", "The real package."),
  },
];

export type Calls = Partial<Record<number, boolean>>;

/** true = marked as a look-alike. */
export const typoRight = (calls: Calls) =>
  INSTALLS.every((p, i) => calls[i] === p.fake);
