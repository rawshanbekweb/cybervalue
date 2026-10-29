// Academy Intermediate · Domains and infrastructure: an invented company's
// DNS records to read for who runs its mail and shop and which record is
// left dangling, and certificate-transparency entries to turn into a list of
// subdomains. Simplified, but the record types and the crt.sh layout are the
// real ones; the company and its domain are invented.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const DOMAIN = "sarbon-logistics.example";

// --- DNS -------------------------------------------------------------------------------

export type DnsRecord = { name: string; type: string; value: string };

export const RECORDS: DnsRecord[] = [
  { name: DOMAIN, type: "NS", value: "ns1.hostline.example." },
  { name: DOMAIN, type: "A", value: "203.0.113.40" },
  { name: DOMAIN, type: "MX", value: "1 aspmx.l.google.com." },
  {
    name: DOMAIN,
    type: "TXT",
    value: '"v=spf1 include:_spf.google.com ~all"',
  },
  {
    name: DOMAIN,
    type: "TXT",
    value: '"google-site-verification=Q2c…"',
  },
  { name: `www.${DOMAIN}`, type: "CNAME", value: `${DOMAIN}.` },
  { name: `shop.${DOMAIN}`, type: "CNAME", value: "shops.myshopify.com." },
  {
    name: `blog.${DOMAIN}`,
    type: "CNAME",
    value: "sarbon-old.ghost.io.  ; → NXDOMAIN",
  },
];

export type Question = {
  id: string;
  ask: Text;
  options: string[];
  answer: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "mail",
    ask: t("Pochtasini kim yuritadi?", "Who runs its email?"),
    options: ["Google Workspace", "Microsoft 365", "hostline.example"],
    answer: "Google Workspace",
  },
  {
    id: "shop",
    ask: t("Do‘kon qayerda ishlaydi?", "Where does the shop run?"),
    options: ["Shopify", "WordPress", "203.0.113.40"],
    answer: "Shopify",
  },
  {
    id: "dangling",
    ask: t(
      "Qaysi yozuv o‘chirilgan xizmatga ishora qiladi (subdomain takeover xavfi)?",
      "Which record points at a deleted service (a subdomain-takeover risk)?",
    ),
    options: [`www.${DOMAIN}`, `shop.${DOMAIN}`, `blog.${DOMAIN}`],
    answer: `blog.${DOMAIN}`,
  },
];

export type Answers = Partial<Record<string, string>>;

export const dnsRight = (a: Answers) =>
  QUESTIONS.every((q) => a[q.id] === q.answer);

// --- Certificate transparency ----------------------------------------------------------

export type Cert = { id: number; logged: string; names: string[] };

/** crt.sh-style rows: one certificate can carry several names. */
export const CERTS: Cert[] = [
  { id: 9120334, logged: "2026-09-14", names: [DOMAIN, `www.${DOMAIN}`] },
  { id: 9120335, logged: "2026-09-14", names: [`shop.${DOMAIN}`] },
  { id: 8800121, logged: "2026-06-02", names: [`vpn.${DOMAIN}`] },
  {
    id: 8800122,
    logged: "2026-06-02",
    names: [`mail.${DOMAIN}`, `autodiscover.${DOMAIN}`],
  },
  { id: 8410977, logged: "2026-03-20", names: [`jenkins.${DOMAIN}`] },
  {
    id: 8410978,
    logged: "2026-03-20",
    names: [`staging.${DOMAIN}`, `dev-api.${DOMAIN}`],
  },
  { id: 7001846, logged: "2025-11-30", names: [`www.${DOMAIN}`, DOMAIN] },
  { id: 6519230, logged: "2025-07-08", names: [`*.${DOMAIN}`] },
];

/** Every distinct name, wildcards left out, sorted. */
export function subdomains(certs: Cert[] = CERTS) {
  const all = new Set(certs.flatMap((c) => c.names));
  return [...all].filter((n) => !n.startsWith("*.")).sort();
}

/** Build and test systems that should never face the internet. */
export const INTERNAL = [
  `jenkins.${DOMAIN}`,
  `staging.${DOMAIN}`,
  `dev-api.${DOMAIN}`,
];

export const ctRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === INTERNAL.length && INTERNAL.every((n) => set.has(n));
};
