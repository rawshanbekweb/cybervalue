import type { Text } from "../network/ip";

// What the lab pages, the student page and the admin show about each
// checkpoint. The questions themselves live in questions.ts (server side).
export type CheckpointMeta = {
  id: string;
  lab: Text;
  title: Text;
  covers: Text;
  href: string;
  // Percent needed to pass.
  pass: number;
  /** Set for checkpoints of the Intermediate level. */
  level?: "intermediate";
};

export const CHECKPOINT_META: readonly CheckpointMeta[] = [
  {
    id: "network-1",
    lab: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    title: {
      uz: "Nazorat: IP, mask va gateway",
      en: "Checkpoint: IP, mask and gateway",
    },
    covers: { uz: "1–6-darslar · 12 savol", en: "Lessons 1–6 · 12 questions" },
    href: "/akademiya/network-basics#checkpoints",
    pass: 70,
  },
  {
    id: "network-2",
    lab: { uz: "IP manzillash laboratoriyasi", en: "IP addressing lab" },
    title: {
      uz: "Nazorat: manzillar qayerdan keladi",
      en: "Checkpoint: where addresses come from",
    },
    covers: {
      uz: "7–12-darslar · 10 savol",
      en: "Lessons 7–12 · 10 questions",
    },
    href: "/akademiya/network-basics#checkpoints",
    pass: 70,
  },
  {
    id: "linux-1",
    lab: { uz: "Linux laboratoriyasi", en: "Linux lab" },
    title: { uz: "Nazorat: Linux asoslari", en: "Checkpoint: Linux basics" },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/linux-basics#checkpoints",
    pass: 70,
  },
  {
    id: "html-1",
    lab: { uz: "HTML asoslari", en: "HTML Basics" },
    title: { uz: "Nazorat: HTML asoslari", en: "Checkpoint: HTML basics" },
    covers: {
      uz: "Barcha 12 darsdan 10 savol",
      en: "10 questions from all 12 lessons",
    },
    href: "/akademiya/html-basics#checkpoints",
    pass: 70,
  },
  {
    id: "security-1",
    lab: { uz: "Veb-xavfsizlik laboratoriyasi", en: "Web Security Lab" },
    title: {
      uz: "Nazorat: veb-xavfsizlik asoslari",
      en: "Checkpoint: web security basics",
    },
    covers: {
      uz: "HTTP, auth, SQLi, XSS, IDOR · 12 savol",
      en: "HTTP, auth, SQLi, XSS, IDOR · 12 questions",
    },
    href: "/akademiya/web-security-lab#checkpoints",
    pass: 70,
  },
  {
    id: "httpbasics-1",
    lab: { uz: "HTTP protokoli", en: "HTTP basics" },
    title: {
      uz: "Nazorat: so‘rov, javob, metod va holat kodi",
      en: "Checkpoint: requests, responses, methods and status codes",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/http-basics#checkpoints",
    pass: 70,
  },
  {
    id: "https-1",
    lab: { uz: "HTTPS va TLS", en: "HTTPS and TLS" },
    title: {
      uz: "Nazorat: shifrlash, TLS va sertifikatlar",
      en: "Checkpoint: encryption, TLS and certificates",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/https#checkpoints",
    pass: 70,
  },
  {
    id: "bash-1",
    lab: { uz: "Bash asoslari", en: "Bash basics" },
    title: {
      uz: "Nazorat: o‘zgaruvchi, sikl va skript",
      en: "Checkpoint: variables, loops and scripts",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/bash#checkpoints",
    pass: 70,
  },
  {
    id: "ssh-1",
    lab: { uz: "SSH", en: "SSH" },
    title: {
      uz: "Nazorat: SSH ulanish va kalitlar",
      en: "Checkpoint: SSH connections and keys",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/ssh#checkpoints",
    pass: 70,
  },
  {
    id: "crypto-1",
    lab: { uz: "Kriptografiya asoslari", en: "Cryptography basics" },
    title: {
      uz: "Nazorat: kodlash, hash, shifr va imzo",
      en: "Checkpoint: encoding, hashes, ciphers and signatures",
    },
    covers: {
      uz: "Barcha darslardan 10 savol",
      en: "10 questions from every lesson",
    },
    href: "/akademiya/crypto#checkpoints",
    pass: 70,
  },
  {
    id: "http-1",
    level: "intermediate",
    lab: { uz: "HTTP chuqurroq", en: "HTTP in depth" },
    title: {
      uz: "Nazorat: HTTP, cookie, CORS va sarlavhalar",
      en: "Checkpoint: HTTP, cookies, CORS and headers",
    },
    covers: {
      uz: "1–10-darslar · 12 savol",
      en: "Lessons 1–10 · 12 questions",
    },
    href: "/intermediate/http#checkpoints",
    pass: 70,
  },
  {
    id: "input-1",
    level: "intermediate",
    lab: { uz: "Kiritilgan ma’lumot xavfi", en: "Untrusted input" },
    title: {
      uz: "Nazorat: inyeksiya, tekshiruv va kodlash",
      en: "Checkpoint: injection, validation and encoding",
    },
    covers: {
      uz: "1–9-darslar · 10 savol",
      en: "Lessons 1–9 · 10 questions",
    },
    href: "/intermediate/input#checkpoints",
    pass: 70,
  },
  {
    id: "browser-1",
    level: "intermediate",
    lab: { uz: "Brauzer tomonidagi xavflar", en: "Browser-side risks" },
    title: {
      uz: "Nazorat: XSS, CSP va CSRF",
      en: "Checkpoint: XSS, CSP and CSRF",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/browser#checkpoints",
    pass: 70,
  },
  {
    id: "access-1",
    level: "intermediate",
    lab: { uz: "Kirish nazorati", en: "Access control" },
    title: {
      uz: "Nazorat: IDOR, JWT va MFA",
      en: "Checkpoint: IDOR, JWT and MFA",
    },
    covers: {
      uz: "1–9-darslar · 10 savol",
      en: "Lessons 1–9 · 10 questions",
    },
    href: "/intermediate/access#checkpoints",
    pass: 70,
  },
  {
    id: "api-1",
    level: "intermediate",
    lab: { uz: "API xavfsizligi", en: "API security" },
    title: {
      uz: "Nazorat: API xavfsizligi",
      en: "Checkpoint: API security",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/api#checkpoints",
    pass: 70,
  },
  {
    id: "classic-1",
    level: "intermediate",
    lab: { uz: "Klassik shifrlar", en: "Classical ciphers" },
    title: {
      uz: "Nazorat: klassik shifrlar",
      en: "Checkpoint: classical ciphers",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/classic#checkpoints",
    pass: 70,
  },
  {
    id: "symmetric-1",
    level: "intermediate",
    lab: { uz: "Simmetrik shifrlash", en: "Symmetric encryption" },
    title: {
      uz: "Nazorat: simmetrik shifrlash",
      en: "Checkpoint: symmetric encryption",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/symmetric#checkpoints",
    pass: 70,
  },
  {
    id: "hashes-1",
    level: "intermediate",
    lab: { uz: "Xesh va parollar", en: "Hashes and passwords" },
    title: {
      uz: "Nazorat: xesh va parollar",
      en: "Checkpoint: hashes and passwords",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/hashes#checkpoints",
    pass: 70,
  },
  {
    id: "pubkey-1",
    level: "intermediate",
    lab: { uz: "Ochiq kalitli kriptografiya", en: "Public-key cryptography" },
    title: {
      uz: "Nazorat: ochiq kalitli kriptografiya",
      en: "Checkpoint: public-key cryptography",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/pubkey#checkpoints",
    pass: 70,
  },
  {
    id: "tls-1",
    level: "intermediate",
    lab: { uz: "TLS va sertifikatlar", en: "TLS and certificates" },
    title: {
      uz: "Nazorat: TLS va sertifikatlar",
      en: "Checkpoint: TLS and certificates",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/tls#checkpoints",
    pass: 70,
  },
  {
    id: "tcpip-1",
    level: "intermediate",
    lab: { uz: "TCP/IP chuqurroq", en: "TCP/IP in depth" },
    title: {
      uz: "Nazorat: TCP/IP chuqurroq",
      en: "Checkpoint: TCP/IP in depth",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/tcpip#checkpoints",
    pass: 70,
  },
  {
    id: "traffic-1",
    level: "intermediate",
    lab: { uz: "Trafik tahlili", en: "Traffic analysis" },
    title: {
      uz: "Nazorat: Trafik tahlili",
      en: "Checkpoint: Traffic analysis",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/traffic#checkpoints",
    pass: 70,
  },
  {
    id: "firewall-1",
    level: "intermediate",
    lab: { uz: "Firewall va segmentlash", en: "Firewalls and segmentation" },
    title: {
      uz: "Nazorat: Firewall va segmentlash",
      en: "Checkpoint: Firewalls and segmentation",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/firewall#checkpoints",
    pass: 70,
  },
  {
    id: "connections-1",
    level: "intermediate",
    lab: { uz: "Xavfsiz ulanishlar", en: "Secure connections" },
    title: {
      uz: "Nazorat: Xavfsiz ulanishlar",
      en: "Checkpoint: Secure connections",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/connections#checkpoints",
    pass: 70,
  },
  {
    id: "ids-1",
    level: "intermediate",
    lab: { uz: "Hujumni aniqlash", en: "Intrusion detection" },
    title: {
      uz: "Nazorat: Hujumni aniqlash",
      en: "Checkpoint: Intrusion detection",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/ids#checkpoints",
    pass: 70,
  },
  {
    id: "evidence-1",
    level: "intermediate",
    lab: { uz: "Dalil bilan ishlash", en: "Handling evidence" },
    title: {
      uz: "Nazorat: Dalil bilan ishlash",
      en: "Checkpoint: Handling evidence",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/evidence#checkpoints",
    pass: 70,
  },
  {
    id: "filesystem-1",
    level: "intermediate",
    lab: { uz: "Fayl tizimlari", en: "File systems" },
    title: {
      uz: "Nazorat: Fayl tizimlari",
      en: "Checkpoint: File systems",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/filesystem#checkpoints",
    pass: 70,
  },
  {
    id: "logs-1",
    level: "intermediate",
    lab: { uz: "Loglar va artefaktlar", en: "Logs and artefacts" },
    title: {
      uz: "Nazorat: Loglar va artefaktlar",
      en: "Checkpoint: Logs and artefacts",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/logs#checkpoints",
    pass: 70,
  },
  {
    id: "response-1",
    level: "intermediate",
    lab: { uz: "Hodisaga javob", en: "Incident response" },
    title: {
      uz: "Nazorat: Hodisaga javob",
      en: "Checkpoint: Incident response",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/response#checkpoints",
    pass: 70,
  },
  {
    id: "report-1",
    level: "intermediate",
    lab: { uz: "Hisobot yozish", en: "Writing the report" },
    title: {
      uz: "Nazorat: Hisobot yozish",
      en: "Checkpoint: Writing the report",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/report#checkpoints",
    pass: 70,
  },
  {
    id: "stego-1",
    level: "intermediate",
    lab: { uz: "Steganografiya: asosiy g‘oya", en: "Steganography: the idea" },
    title: {
      uz: "Nazorat: Steganografiya, asosiy g‘oya",
      en: "Checkpoint: Steganography, the idea",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/stego#checkpoints",
    pass: 70,
  },
  {
    id: "lsb-1",
    level: "intermediate",
    lab: { uz: "Rasm ichida", en: "Inside images" },
    title: {
      uz: "Nazorat: Rasm ichida",
      en: "Checkpoint: Inside images",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/lsb#checkpoints",
    pass: 70,
  },
  {
    id: "metadata-1",
    level: "intermediate",
    lab: { uz: "Metama’lumotlar", en: "Metadata" },
    title: {
      uz: "Nazorat: Metama’lumotlar",
      en: "Checkpoint: Metadata",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/metadata#checkpoints",
    pass: 70,
  },
  {
    id: "formats-1",
    level: "intermediate",
    lab: { uz: "Ovoz va fayl formatlari", en: "Audio and file formats" },
    title: {
      uz: "Nazorat: Ovoz va fayl formatlari",
      en: "Checkpoint: Audio and file formats",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/formats#checkpoints",
    pass: 70,
  },
  {
    id: "steganalysis-1",
    level: "intermediate",
    lab: { uz: "Steganaliz", en: "Steganalysis" },
    title: {
      uz: "Nazorat: Steganaliz",
      en: "Checkpoint: Steganalysis",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/steganalysis#checkpoints",
    pass: 70,
  },
  {
    id: "siem-1",
    level: "intermediate",
    lab: { uz: "Loglar va SIEM", en: "Logs and SIEM" },
    title: {
      uz: "Nazorat: Loglar va SIEM",
      en: "Checkpoint: Logs and SIEM",
    },
    covers: {
      uz: "1–8-darslar · 10 savol",
      en: "Lessons 1–8 · 10 questions",
    },
    href: "/intermediate/siem#checkpoints",
    pass: 70,
  },
];

export const checkpointMeta = (id: string) =>
  CHECKPOINT_META.find((c) => c.id === id) ?? null;

/** The beginner-level checkpoints, which the "every checkpoint" awards count. */
export const BEGINNER_CHECKPOINTS = CHECKPOINT_META.filter((c) => !c.level);
