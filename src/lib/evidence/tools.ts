// Academy Intermediate · Handling evidence: the steps that make a disk image
// stand up as evidence, the chain of custody and where it breaks, and
// checking copies against the hash taken at acquisition. Simplified, but the
// rules are the ones forensic labs follow (write blocker, bit-for-bit image,
// matching hashes, documented hand-overs).
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Acquisition ---------------------------------------------------------------------

export const STEPS = [
  "blocker",
  "hashSource",
  "bitImage",
  "hashImage",
  "workCopy",
] as const;
export type Step = (typeof STEPS)[number];

export type Acquisition = Record<Step, boolean>;

export type Problem = { step: Step; why: Text };

/** What a defence lawyer or a reviewer would pick on, step by step. */
export function problems(a: Acquisition): Problem[] {
  const out: Problem[] = [];
  if (!a.blocker)
    out.push({
      step: "blocker",
      why: t(
        "Write blocker’siz ulangan disk o‘zgaradi: tizim kirish vaqtlarini va jurnallarni yozadi.",
        "Without a write blocker the disk changes: the system writes access times and journals to it.",
      ),
    });
  if (!a.hashSource)
    out.push({
      step: "hashSource",
      why: t(
        "Asl diskning xeshi yo‘q — nusxa asl bilan bir xil ekanini isbotlab bo‘lmaydi.",
        "No hash of the original — nobody can show the image matches it.",
      ),
    });
  if (!a.bitImage)
    out.push({
      step: "bitImage",
      why: t(
        "Fayllarni oddiy nusxalash o‘chirilgan fayllarni, bo‘sh joyni va metama’lumotni tashlab ketadi.",
        "Copying files leaves out deleted files, unallocated space and metadata.",
      ),
    });
  if (!a.hashImage)
    out.push({
      step: "hashImage",
      why: t(
        "Tasvirning xeshi hisoblanmagan — u asl bilan solishtirilmagan.",
        "The image was never hashed, so it was never compared with the original.",
      ),
    });
  if (!a.workCopy)
    out.push({
      step: "workCopy",
      why: t(
        "Tahlil asl tasvirning o‘zida — bitta xato buyruq dalilni buzadi.",
        "Analysis runs on the master image itself — one wrong command spoils the evidence.",
      ),
    });
  return out;
}

export const admissible = (a: Acquisition) => problems(a).length === 0;

// --- Hashes ---------------------------------------------------------------------------

/** SHA-256 written in the acquisition report. */
export const ACQUIRED =
  "9f2c41e8b07d5a3f6e1c8d24b9a07f3e5d6c1b8a2e4f7093c5d8b1a6e2f40c7d";

/** Change one hex digit, the way a single changed byte shows in practice. */
const flip = (hash: string, at: number) =>
  hash.slice(0, at) + (hash[at] === "0" ? "1" : "0") + hash.slice(at + 1);

export type Copy = { name: string; hash: string };

export const COPIES: Copy[] = [
  { name: "lab-copy-1.img", hash: ACQUIRED },
  { name: "lab-copy-2.img", hash: flip(ACQUIRED, 37) },
  { name: "court-copy.img", hash: ACQUIRED },
  { name: "laptop-usb.img", hash: flip(ACQUIRED, 63) },
];

export const intact = (c: Copy) => c.hash === ACQUIRED;

// --- Chain of custody --------------------------------------------------------------------

export type Entry = {
  id: string;
  when: string;
  from: Text;
  to: Text;
  note: Text;
};

const NOBODY = t("—", "—");
const KARIMOV = t("Insp. Karimov", "Insp. Karimov");
const LOCKER = t("Dalillar shkafi B", "Evidence locker B");
const ALIYEVA = t("Serj. Aliyeva", "Sgt. Aliyeva");
const LAB = t(
  "Kriminalistika laboratoriyasi (N. Usmonov)",
  "Forensic lab (N. Usmonov)",
);

/**
 * The hand-overs of one seized laptop. Each one must start with whoever
 * held it at the end of the one before; the gap is the broken link.
 */
export const CUSTODY: Entry[] = [
  {
    id: "seize",
    when: "03.10 14:05",
    from: NOBODY,
    to: KARIMOV,
    note: t(
      "Ofisda olib qo‘yildi, suratga olindi, 0417-raqamli paketga muhrlandi",
      "Seized in the office, photographed, sealed in bag no. 0417",
    ),
  },
  {
    id: "locker",
    when: "03.10 16:40",
    from: KARIMOV,
    to: LOCKER,
    note: t("Muhr butun, imzo qo‘yildi", "Seal intact, signed"),
  },
  {
    id: "lab",
    when: "05.10 09:15",
    from: ALIYEVA,
    to: LAB,
    note: t("Muhr butun, imzo qo‘yildi", "Seal intact, signed"),
  },
  {
    id: "image",
    when: "05.10 11:30",
    from: LAB,
    to: LAB,
    note: t(
      "Tasvir olindi, SHA-256 hisobotga yozildi",
      "Imaged, SHA-256 written in the report",
    ),
  },
  {
    id: "back",
    when: "05.10 17:00",
    from: LAB,
    to: LOCKER,
    note: t("Qayta muhrlandi, imzo qo‘yildi", "Resealed, signed"),
  },
];

/** The first entry that doesn’t start where the previous one ended. */
export function brokenLink(entries: Entry[]) {
  for (let i = 1; i < entries.length; i++)
    if (entries[i].from.en !== entries[i - 1].to.en) return entries[i].id;
  return null;
}
