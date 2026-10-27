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
];

/** Rules met by these facts and not issued yet. */
export function newAwards(facts: AwardFacts, issued: Iterable<string>) {
  const have = new Set(issued);
  return AWARD_RULES.filter((rule) => !have.has(rule.id) && rule.earned(facts));
}
