// Lesson progress of the four track labs, kept in the browser and, for a
// signed-in student, mirrored on the server so it follows them between
// devices and shows on their page. Each lab stores { "<lesson id>": true }.

export const LAB_PROGRESS = {
  network: { key: "cybervalue:network:progress:v1", total: 17 },
  linux: { key: "cybervalue:linux:progress:v1", total: 16 },
  html: { key: "htmldars:progress:v1", total: 12 },
  security: { key: "sabaq:progress:v1", total: 36 },
  http: { key: "cybervalue:http:progress:v1", total: 10 },
  input: { key: "cybervalue:input:progress:v1", total: 9 },
  browser: { key: "cybervalue:browser:progress:v1", total: 8 },
  access: { key: "cybervalue:access:progress:v1", total: 9 },
  api: { key: "cybervalue:api:progress:v1", total: 8 },
  classic: { key: "cybervalue:classic:progress:v1", total: 8 },
  symmetric: { key: "cybervalue:symmetric:progress:v1", total: 8 },
  hashes: { key: "cybervalue:hashes:progress:v1", total: 8 },
  pubkey: { key: "cybervalue:pubkey:progress:v1", total: 8 },
  tls: { key: "cybervalue:tls:progress:v1", total: 8 },
  tcpip: { key: "cybervalue:tcpip:progress:v1", total: 8 },
  traffic: { key: "cybervalue:traffic:progress:v1", total: 8 },
  firewall: { key: "cybervalue:firewall:progress:v1", total: 8 },
  connections: { key: "cybervalue:connections:progress:v1", total: 8 },
  ids: { key: "cybervalue:ids:progress:v1", total: 8 },
  evidence: { key: "cybervalue:evidence:progress:v1", total: 8 },
  filesystem: { key: "cybervalue:filesystem:progress:v1", total: 8 },
  logs: { key: "cybervalue:logs:progress:v1", total: 8 },
  response: { key: "cybervalue:response:progress:v1", total: 8 },
  report: { key: "cybervalue:report:progress:v1", total: 8 },
  stego: { key: "cybervalue:stego:progress:v1", total: 8 },
  lsb: { key: "cybervalue:lsb:progress:v1", total: 8 },
  metadata: { key: "cybervalue:metadata:progress:v1", total: 8 },
  formats: { key: "cybervalue:formats:progress:v1", total: 8 },
  steganalysis: { key: "cybervalue:steganalysis:progress:v1", total: 8 },
  siem: { key: "cybervalue:siem:progress:v1", total: 8 },
  detection: { key: "cybervalue:detection:progress:v1", total: 8 },
  triage: { key: "cybervalue:triage:progress:v1", total: 8 },
  hunting: { key: "cybervalue:hunting:progress:v1", total: 8 },
  phishing: { key: "cybervalue:phishing:progress:v1", total: 8 },
  ethics: { key: "cybervalue:ethics:progress:v1", total: 8 },
  search: { key: "cybervalue:search:progress:v1", total: 8 },
  infra: { key: "cybervalue:infra:progress:v1", total: 8 },
  geo: { key: "cybervalue:geo:progress:v1", total: 8 },
  footprint: { key: "cybervalue:footprint:progress:v1", total: 8 },
  stride: { key: "cybervalue:stride:progress:v1", total: 8 },
  securecode: { key: "cybervalue:securecode:progress:v1", total: 8 },
  supplychain: { key: "cybervalue:supplychain:progress:v1", total: 8 },
  httpbasics: { key: "cybervalue:http-basics:progress:v1", total: 9 },
  https: { key: "cybervalue:https:progress:v1", total: 9 },
  bash: { key: "cybervalue:bash:progress:v1", total: 9 },
  ssh: { key: "cybervalue:ssh:progress:v1", total: 8 },
  crypto: { key: "cybervalue:crypto:progress:v1", total: 11 },
  scams: { key: "cybervalue:scams:progress:v1", total: 8 },
} as const;

export type LabId = keyof typeof LAB_PROGRESS;

// Names and pages of the labs, for the student page and assignments.
export const LAB_META: {
  id: LabId;
  title: { uz: string; en: string };
  href: string;
  /** Opens only at the Intermediate level and above. */
  intermediate?: boolean;
}[] = [
  {
    id: "network",
    title: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    href: "/akademiya/network-basics",
  },
  {
    id: "linux",
    title: { uz: "Linux asoslari laboratoriyasi", en: "Linux foundations lab" },
    href: "/akademiya/linux-basics",
  },
  {
    id: "html",
    title: { uz: "HTML asoslari", en: "HTML Basics" },
    href: "/akademiya/html-basics",
  },
  {
    id: "security",
    title: { uz: "Veb-xavfsizlik laboratoriyasi", en: "Web Security Lab" },
    href: "/akademiya/web-security-lab",
  },
  {
    id: "httpbasics",
    title: { uz: "HTTP asoslari", en: "HTTP basics" },
    href: "/akademiya/http-basics",
  },
  {
    id: "https",
    title: { uz: "HTTPS va TLS", en: "HTTPS and TLS" },
    href: "/akademiya/https",
  },
  {
    id: "bash",
    title: { uz: "Bash asoslari", en: "Bash basics" },
    href: "/akademiya/bash",
  },
  {
    id: "ssh",
    title: { uz: "SSH: masofaviy ulanish", en: "SSH: remote access" },
    href: "/akademiya/ssh",
  },
  {
    id: "crypto",
    title: { uz: "Kriptografiya asoslari", en: "Cryptography basics" },
    href: "/akademiya/crypto",
  },
  {
    id: "scams",
    title: { uz: "Firibgarlik simulyatori", en: "Scam simulator" },
    href: "/firibgarlik",
  },
  {
    id: "http",
    title: {
      uz: "HTTP chuqurroq (Intermediate)",
      en: "HTTP in depth (Intermediate)",
    },
    href: "/intermediate/http",
    intermediate: true,
  },
  {
    id: "input",
    title: {
      uz: "Kiritilgan ma’lumot xavfi (Intermediate)",
      en: "Untrusted input (Intermediate)",
    },
    href: "/intermediate/input",
    intermediate: true,
  },
  {
    id: "browser",
    title: {
      uz: "Brauzer tomonidagi xavflar (Intermediate)",
      en: "Browser-side risks (Intermediate)",
    },
    href: "/intermediate/browser",
    intermediate: true,
  },
  {
    id: "access",
    title: {
      uz: "Kirish nazorati (Intermediate)",
      en: "Access control (Intermediate)",
    },
    href: "/intermediate/access",
    intermediate: true,
  },
  {
    id: "api",
    title: {
      uz: "API xavfsizligi (Intermediate)",
      en: "API security (Intermediate)",
    },
    href: "/intermediate/api",
    intermediate: true,
  },
  {
    id: "classic",
    title: {
      uz: "Klassik shifrlar (Intermediate)",
      en: "Classical ciphers (Intermediate)",
    },
    href: "/intermediate/classic",
    intermediate: true,
  },
  {
    id: "symmetric",
    title: {
      uz: "Simmetrik shifrlash (Intermediate)",
      en: "Symmetric encryption (Intermediate)",
    },
    href: "/intermediate/symmetric",
    intermediate: true,
  },
  {
    id: "hashes",
    title: {
      uz: "Xesh va parollar (Intermediate)",
      en: "Hashes and passwords (Intermediate)",
    },
    href: "/intermediate/hashes",
    intermediate: true,
  },
  {
    id: "pubkey",
    title: {
      uz: "Ochiq kalitli kriptografiya (Intermediate)",
      en: "Public-key cryptography (Intermediate)",
    },
    href: "/intermediate/pubkey",
    intermediate: true,
  },
  {
    id: "tls",
    title: {
      uz: "TLS va sertifikatlar (Intermediate)",
      en: "TLS and certificates (Intermediate)",
    },
    href: "/intermediate/tls",
    intermediate: true,
  },
  {
    id: "tcpip",
    title: {
      uz: "TCP/IP chuqurroq (Intermediate)",
      en: "TCP/IP in depth (Intermediate)",
    },
    href: "/intermediate/tcpip",
    intermediate: true,
  },
  {
    id: "traffic",
    title: {
      uz: "Trafik tahlili (Intermediate)",
      en: "Traffic analysis (Intermediate)",
    },
    href: "/intermediate/traffic",
    intermediate: true,
  },
  {
    id: "firewall",
    title: {
      uz: "Firewall va segmentlash (Intermediate)",
      en: "Firewalls and segmentation (Intermediate)",
    },
    href: "/intermediate/firewall",
    intermediate: true,
  },
  {
    id: "connections",
    title: {
      uz: "Xavfsiz ulanishlar (Intermediate)",
      en: "Secure connections (Intermediate)",
    },
    href: "/intermediate/connections",
    intermediate: true,
  },
  {
    id: "ids",
    title: {
      uz: "Hujumni aniqlash (Intermediate)",
      en: "Intrusion detection (Intermediate)",
    },
    href: "/intermediate/ids",
    intermediate: true,
  },
  {
    id: "evidence",
    title: {
      uz: "Dalil bilan ishlash (Intermediate)",
      en: "Handling evidence (Intermediate)",
    },
    href: "/intermediate/evidence",
    intermediate: true,
  },
  {
    id: "filesystem",
    title: {
      uz: "Fayl tizimlari (Intermediate)",
      en: "File systems (Intermediate)",
    },
    href: "/intermediate/filesystem",
    intermediate: true,
  },
  {
    id: "logs",
    title: {
      uz: "Loglar va artefaktlar (Intermediate)",
      en: "Logs and artefacts (Intermediate)",
    },
    href: "/intermediate/logs",
    intermediate: true,
  },
  {
    id: "response",
    title: {
      uz: "Hodisaga javob (Intermediate)",
      en: "Incident response (Intermediate)",
    },
    href: "/intermediate/response",
    intermediate: true,
  },
  {
    id: "report",
    title: {
      uz: "Hisobot yozish (Intermediate)",
      en: "Writing the report (Intermediate)",
    },
    href: "/intermediate/report",
    intermediate: true,
  },
  {
    id: "stego",
    title: {
      uz: "Steganografiya: asosiy g‘oya (Intermediate)",
      en: "Steganography: the idea (Intermediate)",
    },
    href: "/intermediate/stego",
    intermediate: true,
  },
  {
    id: "lsb",
    title: {
      uz: "Rasm ichida (Intermediate)",
      en: "Inside images (Intermediate)",
    },
    href: "/intermediate/lsb",
    intermediate: true,
  },
  {
    id: "metadata",
    title: {
      uz: "Metama’lumotlar (Intermediate)",
      en: "Metadata (Intermediate)",
    },
    href: "/intermediate/metadata",
    intermediate: true,
  },
  {
    id: "formats",
    title: {
      uz: "Ovoz va fayl formatlari (Intermediate)",
      en: "Audio and file formats (Intermediate)",
    },
    href: "/intermediate/formats",
    intermediate: true,
  },
  {
    id: "steganalysis",
    title: {
      uz: "Steganaliz (Intermediate)",
      en: "Steganalysis (Intermediate)",
    },
    href: "/intermediate/steganalysis",
    intermediate: true,
  },
  {
    id: "siem",
    title: {
      uz: "Loglar va SIEM (Intermediate)",
      en: "Logs and SIEM (Intermediate)",
    },
    href: "/intermediate/siem",
    intermediate: true,
  },
  {
    id: "detection",
    title: {
      uz: "Aniqlash qoidalari (Intermediate)",
      en: "Detection rules (Intermediate)",
    },
    href: "/intermediate/detection",
    intermediate: true,
  },
  {
    id: "triage",
    title: {
      uz: "Ogohlantirishni saralash (Intermediate)",
      en: "Alert triage (Intermediate)",
    },
    href: "/intermediate/triage",
    intermediate: true,
  },
  {
    id: "hunting",
    title: {
      uz: "Tahdid izlash (Intermediate)",
      en: "Threat hunting (Intermediate)",
    },
    href: "/intermediate/hunting",
    intermediate: true,
  },
  {
    id: "phishing",
    title: {
      uz: "Fishing tahlili (Intermediate)",
      en: "Phishing analysis (Intermediate)",
    },
    href: "/intermediate/phishing",
    intermediate: true,
  },
  {
    id: "ethics",
    title: {
      uz: "Axloq va qonun (Intermediate)",
      en: "Ethics and law (Intermediate)",
    },
    href: "/intermediate/ethics",
    intermediate: true,
  },
  {
    id: "search",
    title: {
      uz: "Qidiruv texnikasi (Intermediate)",
      en: "Search technique (Intermediate)",
    },
    href: "/intermediate/search",
    intermediate: true,
  },
  {
    id: "infra",
    title: {
      uz: "Domen va infratuzilma (Intermediate)",
      en: "Domains and infrastructure (Intermediate)",
    },
    href: "/intermediate/infra",
    intermediate: true,
  },
  {
    id: "geo",
    title: {
      uz: "Rasm va joylashuv (Intermediate)",
      en: "Images and location (Intermediate)",
    },
    href: "/intermediate/geo",
    intermediate: true,
  },
  {
    id: "footprint",
    title: {
      uz: "Raqamli iz (Intermediate)",
      en: "Digital footprint (Intermediate)",
    },
    href: "/intermediate/footprint",
    intermediate: true,
  },
  {
    id: "stride",
    title: {
      uz: "Tahdid modeli (Intermediate)",
      en: "Threat modelling (Intermediate)",
    },
    href: "/intermediate/stride",
    intermediate: true,
  },
  {
    id: "securecode",
    title: {
      uz: "Xavfsiz kod yozish (Intermediate)",
      en: "Secure coding (Intermediate)",
    },
    href: "/intermediate/securecode",
    intermediate: true,
  },
  {
    id: "supplychain",
    title: {
      uz: "Kutubxonalar va ta’minot zanjiri (Intermediate)",
      en: "Dependencies and supply chain (Intermediate)",
    },
    href: "/intermediate/supplychain",
    intermediate: true,
  },
];

export const isLabId = (value: unknown): value is LabId =>
  typeof value === "string" && Object.hasOwn(LAB_PROGRESS, value);

/** Completed lesson numbers (1…total) from a stored record or a list. */
export function lessonList(raw: unknown, total: number): number[] {
  const ids = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? Object.entries(raw)
          .filter(([, done]) => done === true)
          .map(([id]) => Number(id))
      : [];
  return [
    ...new Set(
      ids.filter(
        (id): id is number => Number.isInteger(id) && id >= 1 && id <= total,
      ),
    ),
  ].sort((a, b) => a - b);
}

export const toRecord = (lessons: number[]) =>
  Object.fromEntries(lessons.map((id) => [String(id), true]));
