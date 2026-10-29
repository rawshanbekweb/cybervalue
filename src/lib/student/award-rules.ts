// Certificates the site issues by itself once a student meets the rule. The
// rule id is stored with the certificate, so each one is issued only once.
import { BEGINNER_CHECKPOINTS, CHECKPOINT_META } from "../checkpoints/meta";
import { LAB_PROGRESS, type LabId } from "../lab-progress";

export type AwardFacts = {
  // Lessons finished per lab.
  labs: Partial<Record<LabId, number>>;
  // Best checkpoint percent per checkpoint id.
  checkpoints: Record<string, number>;
};

export type AwardRule = {
  id: string;
  title: string;
  earned: (facts: AwardFacts) => boolean;
};

const passed = (facts: AwardFacts, id: string) => {
  const meta = CHECKPOINT_META.find((c) => c.id === id);
  return meta !== undefined && (facts.checkpoints[id] ?? -1) >= meta.pass;
};
const finished = (facts: AwardFacts, lab: LabId) =>
  (facts.labs[lab] ?? 0) >= LAB_PROGRESS[lab].total;

// Titles are in Uzbek, like the certificates the teacher issues.
export const AWARD_RULES: readonly AwardRule[] = [
  {
    id: "lab-network",
    title: "IP manzillash va tarmoq asoslari",
    earned: (f) =>
      finished(f, "network") &&
      passed(f, "network-1") &&
      passed(f, "network-2"),
  },
  {
    id: "lab-linux",
    title: "Linux asoslari",
    earned: (f) => finished(f, "linux") && passed(f, "linux-1"),
  },
  {
    id: "lab-html",
    title: "HTML asoslari",
    earned: (f) => finished(f, "html") && passed(f, "html-1"),
  },
  {
    id: "lab-security",
    title: "Veb-xavfsizlik asoslari",
    earned: (f) => finished(f, "security") && passed(f, "security-1"),
  },
  {
    id: "lab-httpbasics",
    title: "HTTP protokoli asoslari",
    earned: (f) => finished(f, "httpbasics") && passed(f, "httpbasics-1"),
  },
  {
    id: "lab-https",
    title: "HTTPS va TLS",
    earned: (f) => finished(f, "https") && passed(f, "https-1"),
  },
  {
    id: "lab-bash",
    title: "Bash asoslari",
    earned: (f) => finished(f, "bash") && passed(f, "bash-1"),
  },
  {
    id: "lab-ssh",
    title: "SSH: masofadan ulanish",
    earned: (f) => finished(f, "ssh") && passed(f, "ssh-1"),
  },
  {
    id: "lab-crypto",
    title: "Kriptografiya asoslari",
    earned: (f) => finished(f, "crypto") && passed(f, "crypto-1"),
  },
  {
    id: "checkpoints-all",
    title: "Barcha laboratoriya nazoratlari",
    // The beginner labs; Intermediate modules have their own awards.
    earned: (f) => BEGINNER_CHECKPOINTS.every((c) => passed(f, c.id)),
  },
  {
    id: "lab-http",
    title: "HTTP chuqurroq (Intermediate)",
    earned: (f) => finished(f, "http") && passed(f, "http-1"),
  },
  {
    id: "lab-input",
    title: "Kiritilgan ma’lumot xavfi (Intermediate)",
    earned: (f) => finished(f, "input") && passed(f, "input-1"),
  },
  {
    id: "lab-browser",
    title: "Brauzer tomonidagi xavflar (Intermediate)",
    earned: (f) => finished(f, "browser") && passed(f, "browser-1"),
  },
  {
    id: "lab-access",
    title: "Kirish nazorati (Intermediate)",
    earned: (f) => finished(f, "access") && passed(f, "access-1"),
  },
  {
    id: "lab-api",
    title: "API xavfsizligi (Intermediate)",
    earned: (f) => finished(f, "api") && passed(f, "api-1"),
  },
  {
    id: "lab-classic",
    title: "Klassik shifrlar (Intermediate)",
    earned: (f) => finished(f, "classic") && passed(f, "classic-1"),
  },
  {
    id: "lab-symmetric",
    title: "Simmetrik shifrlash (Intermediate)",
    earned: (f) => finished(f, "symmetric") && passed(f, "symmetric-1"),
  },
  {
    id: "lab-hashes",
    title: "Xesh va parollar (Intermediate)",
    earned: (f) => finished(f, "hashes") && passed(f, "hashes-1"),
  },
  {
    id: "lab-pubkey",
    title: "Ochiq kalitli kriptografiya (Intermediate)",
    earned: (f) => finished(f, "pubkey") && passed(f, "pubkey-1"),
  },
  {
    id: "lab-tls",
    title: "TLS va sertifikatlar (Intermediate)",
    earned: (f) => finished(f, "tls") && passed(f, "tls-1"),
  },
  {
    id: "lab-tcpip",
    title: "TCP/IP chuqurroq (Intermediate)",
    earned: (f) => finished(f, "tcpip") && passed(f, "tcpip-1"),
  },
  {
    id: "lab-traffic",
    title: "Trafik tahlili (Intermediate)",
    earned: (f) => finished(f, "traffic") && passed(f, "traffic-1"),
  },
  {
    id: "lab-firewall",
    title: "Firewall va segmentlash (Intermediate)",
    earned: (f) => finished(f, "firewall") && passed(f, "firewall-1"),
  },
  {
    id: "lab-connections",
    title: "Xavfsiz ulanishlar (Intermediate)",
    earned: (f) => finished(f, "connections") && passed(f, "connections-1"),
  },
  {
    id: "lab-ids",
    title: "Hujumni aniqlash (Intermediate)",
    earned: (f) => finished(f, "ids") && passed(f, "ids-1"),
  },
  {
    id: "lab-evidence",
    title: "Dalil bilan ishlash (Intermediate)",
    earned: (f) => finished(f, "evidence") && passed(f, "evidence-1"),
  },
  {
    id: "lab-filesystem",
    title: "Fayl tizimlari (Intermediate)",
    earned: (f) => finished(f, "filesystem") && passed(f, "filesystem-1"),
  },
  {
    id: "lab-logs",
    title: "Loglar va artefaktlar (Intermediate)",
    earned: (f) => finished(f, "logs") && passed(f, "logs-1"),
  },
  {
    id: "lab-response",
    title: "Hodisaga javob (Intermediate)",
    earned: (f) => finished(f, "response") && passed(f, "response-1"),
  },
  {
    id: "lab-report",
    title: "Hisobot yozish (Intermediate)",
    earned: (f) => finished(f, "report") && passed(f, "report-1"),
  },
  {
    id: "lab-stego",
    title: "Steganografiya: asosiy g‘oya (Intermediate)",
    earned: (f) => finished(f, "stego") && passed(f, "stego-1"),
  },
  {
    id: "lab-lsb",
    title: "Rasm ichida (Intermediate)",
    earned: (f) => finished(f, "lsb") && passed(f, "lsb-1"),
  },
  {
    id: "lab-metadata",
    title: "Metama’lumotlar (Intermediate)",
    earned: (f) => finished(f, "metadata") && passed(f, "metadata-1"),
  },
  {
    id: "lab-formats",
    title: "Ovoz va fayl formatlari (Intermediate)",
    earned: (f) => finished(f, "formats") && passed(f, "formats-1"),
  },
  {
    id: "lab-steganalysis",
    title: "Steganaliz (Intermediate)",
    earned: (f) => finished(f, "steganalysis") && passed(f, "steganalysis-1"),
  },
  {
    id: "lab-siem",
    title: "Loglar va SIEM (Intermediate)",
    earned: (f) => finished(f, "siem") && passed(f, "siem-1"),
  },
  {
    id: "lab-detection",
    title: "Aniqlash qoidalari (Intermediate)",
    earned: (f) => finished(f, "detection") && passed(f, "detection-1"),
  },
  {
    id: "lab-triage",
    title: "Ogohlantirishni saralash (Intermediate)",
    earned: (f) => finished(f, "triage") && passed(f, "triage-1"),
  },
  {
    id: "lab-hunting",
    title: "Tahdid izlash (Intermediate)",
    earned: (f) => finished(f, "hunting") && passed(f, "hunting-1"),
  },
  {
    id: "lab-phishing",
    title: "Fishing tahlili (Intermediate)",
    earned: (f) => finished(f, "phishing") && passed(f, "phishing-1"),
  },
  {
    id: "lab-ethics",
    title: "Axloq va qonun (Intermediate)",
    earned: (f) => finished(f, "ethics") && passed(f, "ethics-1"),
  },
  {
    id: "lab-search",
    title: "Qidiruv texnikasi (Intermediate)",
    earned: (f) => finished(f, "search") && passed(f, "search-1"),
  },
  {
    id: "lab-infra",
    title: "Domen va infratuzilma (Intermediate)",
    earned: (f) => finished(f, "infra") && passed(f, "infra-1"),
  },
  {
    id: "lab-geo",
    title: "Rasm va joylashuv (Intermediate)",
    earned: (f) => finished(f, "geo") && passed(f, "geo-1"),
  },
  {
    id: "lab-footprint",
    title: "Raqamli iz (Intermediate)",
    earned: (f) => finished(f, "footprint") && passed(f, "footprint-1"),
  },
  {
    id: "lab-stride",
    title: "Tahdid modeli (Intermediate)",
    earned: (f) => finished(f, "stride") && passed(f, "stride-1"),
  },
];

/** Rules met by these facts and not issued yet. */
export function newAwards(facts: AwardFacts, issued: Iterable<string>) {
  const have = new Set(issued);
  return AWARD_RULES.filter((rule) => !have.has(rule.id) && rule.earned(facts));
}
