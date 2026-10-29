// Academy Intermediate · Firewalls and segmentation: a small company split
// into zones, a first-match rule list with a default policy, stateless and
// stateful filtering of replies, and how narrow a rule should be. Simplified,
// but first match, default deny and connection tracking work as in
// iptables/nftables and cloud security groups.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- The network -------------------------------------------------------------------

export const ZONES = ["internet", "lan", "dmz", "servers"] as const;
export type Zone = (typeof ZONES)[number];

/** Who talks: the outside world, office PCs, and the company's servers. */
export const ENDPOINTS = {
  internet: { zone: "internet", label: t("Internet", "Internet") },
  lan: {
    zone: "lan",
    label: t("10.0.0.31 (ofis PC)", "10.0.0.31 (office PC)"),
  },
  admin: { zone: "lan", label: t("10.0.0.50 (admin)", "10.0.0.50 (admin)") },
  web: { zone: "dmz", label: t("10.1.0.10 (veb)", "10.1.0.10 (web)") },
  mail: { zone: "dmz", label: t("10.1.0.20 (pochta)", "10.1.0.20 (mail)") },
  db: { zone: "servers", label: t("10.2.0.5 (baza)", "10.2.0.5 (database)") },
  backup: {
    zone: "servers",
    label: t("10.2.0.9 (zaxira)", "10.2.0.9 (backup)"),
  },
} as const satisfies Record<string, { zone: Zone; label: Text }>;
export type Endpoint = keyof typeof ENDPOINTS;

/** A rule's source or destination: anything, a zone, or one host. */
export type Net = "any" | Zone | Endpoint;

export function netMatches(net: Net, e: Endpoint) {
  if (net === "any") return true;
  if (net === e) return true;
  return (
    (ZONES as readonly string[]).includes(net) && ENDPOINTS[e].zone === net
  );
}

export type Flow = {
  from: Endpoint;
  to: Endpoint;
  port: number;
};

export type Rule = {
  id: string;
  action: "allow" | "deny";
  src: Net;
  dst: Net;
  port: number | "any";
};

export const ruleMatches = (r: Rule, f: Flow) =>
  netMatches(r.src, f.from) &&
  netMatches(r.dst, f.to) &&
  (r.port === "any" || r.port === f.port);

/** First match wins; nothing matched means the default policy. */
export function decide(
  rules: Rule[],
  fallback: "allow" | "deny",
  f: Flow,
): { action: "allow" | "deny"; by: string | null } {
  const hit = rules.find((r) => ruleMatches(r, f));
  return hit
    ? { action: hit.action, by: hit.id }
    : { action: fallback, by: null };
}

/** How a rule reads in a firewall listing. */
export const ruleText = (r: Rule) =>
  `${r.action.toUpperCase()} ${r.src} → ${r.dst} ${r.port === "any" ? "any" : `tcp/${r.port}`}`;

// --- Rule order ----------------------------------------------------------------------

export const RULES: Rule[] = [
  { id: "A", action: "allow", src: "lan", dst: "internet", port: "any" },
  { id: "B", action: "allow", src: "internet", dst: "web", port: 443 },
  { id: "C", action: "allow", src: "web", dst: "db", port: 5432 },
  { id: "D", action: "allow", src: "admin", dst: "web", port: 22 },
  { id: "E", action: "deny", src: "lan", dst: "web", port: 22 },
  { id: "F", action: "allow", src: "lan", dst: "dmz", port: "any" },
];

/** The order the lesson starts from: the broad rule shadows the rest. */
export const START_ORDER = ["F", "E", "D", "A", "B", "C"];

export type Case = Flow & { want: "allow" | "deny"; why: Text };

export const CASES: Case[] = [
  {
    from: "internet",
    to: "web",
    port: 443,
    want: "allow",
    why: t("Mijozlar saytni ochadi", "Customers open the site"),
  },
  {
    from: "internet",
    to: "web",
    port: 22,
    want: "deny",
    why: t("SSH internetga ochiq emas", "SSH is not open to the internet"),
  },
  {
    from: "web",
    to: "db",
    port: 5432,
    want: "allow",
    why: t("Sayt bazaga yozadi", "The site writes to its database"),
  },
  {
    from: "internet",
    to: "db",
    port: 5432,
    want: "deny",
    why: t(
      "Baza tashqaridan ko‘rinmaydi",
      "The database is not reachable from outside",
    ),
  },
  {
    from: "admin",
    to: "web",
    port: 22,
    want: "allow",
    why: t("Admin serverni boshqaradi", "The admin manages the server"),
  },
  {
    from: "lan",
    to: "web",
    port: 22,
    want: "deny",
    why: t(
      "Oddiy xodimga SSH kerak emas",
      "An ordinary office PC needs no SSH",
    ),
  },
  {
    from: "lan",
    to: "web",
    port: 443,
    want: "allow",
    why: t("Xodimlar ham saytni ochadi", "Staff open the site too"),
  },
  {
    from: "web",
    to: "internet",
    port: 443,
    want: "deny",
    why: t(
      "Server o‘zi tashqariga chiqmaydi (C2 va o‘g‘irlikka to‘siq)",
      "The server does not call out (blocks C2 and data theft)",
    ),
  },
];

export function orderResults(order: string[], fallback: "allow" | "deny") {
  const rules = order.map((id) => RULES.find((r) => r.id === id)!);
  return CASES.map((c) => {
    const d = decide(rules, fallback, c);
    return { ...c, got: d.action, by: d.by, ok: d.action === c.want };
  });
}

export const orderSolved = (order: string[], fallback: "allow" | "deny") =>
  orderResults(order, fallback).every((r) => r.ok);

// --- Stateless and stateful --------------------------------------------------------------

export type StateSetup = {
  /** Track connections and let replies to them back in. */
  stateful: boolean;
  /** The stateless workaround: allow anything inbound from source port 443. */
  fromPort443: boolean;
};

export type Inbound = {
  id: "reply" | "spoofed" | "probe";
  label: Text;
  /** Part of a connection an office PC opened? */
  established: boolean;
  sport: number;
  want: "allow" | "deny";
};

export const INBOUND: Inbound[] = [
  {
    id: "reply",
    label: t(
      "bank.uz:443 → 10.0.0.31:50122, ofis kompyuteri ochgan ulanishga javob",
      "bank.uz:443 → 10.0.0.31:50122, the reply to a connection the office PC opened",
    ),
    established: true,
    sport: 443,
    want: "allow",
  },
  {
    id: "spoofed",
    label: t(
      "203.0.113.7:443 → 10.0.0.31:3389, hech kim so‘ramagan, manba porti 443",
      "203.0.113.7:443 → 10.0.0.31:3389, unasked for, source port 443",
    ),
    established: false,
    sport: 443,
    want: "deny",
  },
  {
    id: "probe",
    label: t(
      "203.0.113.7:51000 → 10.0.0.31:3389, hech kim so‘ramagan",
      "203.0.113.7:51000 → 10.0.0.31:3389, unasked for",
    ),
    established: false,
    sport: 51_000,
    want: "deny",
  },
];

export function inbound(s: StateSetup, p: Inbound): "allow" | "deny" {
  if (s.stateful && p.established) return "allow";
  if (s.fromPort443 && p.sport === 443) return "allow";
  return "deny";
}

export const stateSolved = (s: StateSetup) =>
  INBOUND.every((p) => inbound(s, p) === p.want);

// --- Least privilege -----------------------------------------------------------------------

export const SRC_CHOICES = ["any", "dmz", "web"] as const satisfies Net[];
export const DST_CHOICES = ["any", "servers", "db"] as const satisfies Net[];
export const PORT_CHOICES = ["any", 5432] as const;

/** The one flow the web server needs. */
export const NEEDED: Flow = { from: "web", to: "db", port: 5432 };

/** Flows nobody asked for; each one a wide rule lets through is a finding. */
export const PROBES: Flow[] = [
  { from: "mail", to: "db", port: 5432 },
  { from: "web", to: "backup", port: 5432 },
  { from: "web", to: "db", port: 22 },
  { from: "lan", to: "db", port: 5432 },
  { from: "internet", to: "db", port: 5432 },
  { from: "web", to: "backup", port: 445 },
];

export type Narrow = {
  src: (typeof SRC_CHOICES)[number];
  dst: (typeof DST_CHOICES)[number];
  port: (typeof PORT_CHOICES)[number];
};

export function narrowCheck(n: Narrow) {
  const rule: Rule = { id: "N", action: "allow", ...n };
  return {
    needed: ruleMatches(rule, NEEDED),
    extra: PROBES.filter((f) => ruleMatches(rule, f)),
  };
}

export const narrowSolved = (n: Narrow) => {
  const r = narrowCheck(n);
  return r.needed && r.extra.length === 0;
};
