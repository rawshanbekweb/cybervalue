// Academy Intermediate · OSINT search technique: a tiny search engine over
// twelve invented pages that understands the operators real engines do —
// site:, filetype:, intitle:, "exact phrase" and -exclude — so a student can
// narrow a query down to the one exposed document.

export type Doc = {
  url: string;
  title: string;
  text: string;
};

export const DOCS: Doc[] = [
  {
    url: "https://sarbon-logistics.example/",
    title: "Sarbon Logistics — freight across Central Asia",
    text: "Road and rail freight, warehousing and customs. Ask for our price list.",
  },
  {
    url: "https://sarbon-logistics.example/about",
    title: "About Sarbon Logistics",
    text: "Founded in 2014 in Tashkent. Our team and our history.",
  },
  {
    url: "https://sarbon-logistics.example/files/brochure-2026.pdf",
    title: "Sarbon Logistics brochure 2026",
    text: "Services, routes and contacts. Public brochure for customers.",
  },
  {
    url: "https://sarbon-logistics.example/files/price-list-internal.pdf",
    title: "Internal price list — not for distribution",
    text: "Internal price list with partner discounts and margins. Confidential.",
  },
  {
    url: "https://sarbon-logistics.example/files/price-list-draft.pdf",
    title: "Price list draft",
    text: "Draft price list, old figures, superseded.",
  },
  {
    url: "https://sarbon-logistics.example/careers",
    title: "Careers at Sarbon Logistics",
    text: "Open roles: network administrator (Fortinet, VMware), driver, accountant.",
  },
  {
    url: "https://sarbon-logistics.example/files/careers.docx",
    title: "Job description: network administrator",
    text: "Experience with Fortinet firewalls and VMware. Price list systems knowledge a plus.",
  },
  {
    url: "https://news.example/2025/sarbon-wins-contract",
    title: "Sarbon Logistics wins rail contract",
    text: "The company’s price list for rail freight was not disclosed.",
  },
  {
    url: "https://forum.example/t/sarbon-price-list",
    title: "Anyone have Sarbon’s price list?",
    text: "Looking for the Sarbon Logistics price list pdf, will pay.",
  },
  {
    url: "https://competitor.example/files/price-list.pdf",
    title: "Competitor price list",
    text: "Our price list for freight, 2026.",
  },
  {
    url: "https://sarbon-logistics.example/blog/new-warehouse",
    title: "Our new warehouse in Samarkand",
    text: "We opened a 12,000 m² warehouse. Updated price list coming soon.",
  },
  {
    url: "https://cdn.sarbon-logistics.example/files/price-list-internal.pdf.bak",
    title: "Index of /files",
    text: "price-list-internal.pdf.bak backup copy",
  },
];

export const TARGET =
  "https://sarbon-logistics.example/files/price-list-internal.pdf";

export type Query = {
  site?: string;
  filetype?: string;
  intitle: string[];
  phrases: string[];
  words: string[];
  exclude: string[];
};

/** Split a query into operators, "phrases", -exclusions and plain words. */
export function parse(q: string): Query {
  const out: Query = { intitle: [], phrases: [], words: [], exclude: [] };
  const re = /(-?)(?:(\w+):)?(?:"([^"]*)"|(\S+))/g;
  for (const m of q.matchAll(re)) {
    const [, neg, op, quoted, bare] = m;
    const value = (quoted ?? bare ?? "").toLowerCase();
    if (!value) continue;
    if (neg) out.exclude.push(value);
    else if (op === "site") out.site = value;
    else if (op === "filetype" || op === "ext") out.filetype = value;
    else if (op === "intitle") out.intitle.push(value);
    else if (quoted !== undefined) out.phrases.push(value);
    else out.words.push(op ? `${op}:${value}` : value);
  }
  return out;
}

const hostOf = (url: string) => new URL(url).hostname;
const extOf = (url: string) => {
  const path = new URL(url).pathname;
  const dot = path.lastIndexOf(".");
  return dot > path.lastIndexOf("/") ? path.slice(dot + 1).toLowerCase() : "";
};

export function matches(q: Query, d: Doc) {
  const body = `${d.title} ${d.text} ${d.url}`.toLowerCase();
  const host = hostOf(d.url);
  if (q.site && host !== q.site && !host.endsWith(`.${q.site}`)) return false;
  if (q.filetype && extOf(d.url) !== q.filetype) return false;
  if (!q.intitle.every((w) => d.title.toLowerCase().includes(w))) return false;
  if (!q.phrases.every((p) => body.includes(p))) return false;
  if (!q.words.every((w) => body.includes(w))) return false;
  return !q.exclude.some((w) => body.includes(w));
}

/** An empty query finds nothing, as on a real engine. */
export function search(raw: string): Doc[] {
  if (!raw.trim()) return [];
  const q = parse(raw);
  return DOCS.filter((d) => matches(q, d));
}

export const found = (raw: string) => {
  const r = search(raw);
  return r.length === 1 && r[0].url === TARGET;
};
