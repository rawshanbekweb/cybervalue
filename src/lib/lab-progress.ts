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
