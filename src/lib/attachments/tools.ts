// Academy Intermediate · Opening attachments safely: eight files that arrived
// at an invented company, four of which should not be opened.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Attachment = {
  name: string;
  from: Text;
  risky: boolean;
  why: Text;
};

export const ATTACHMENTS: Attachment[] = [
  {
    name: "report_q3.pdf",
    from: t(
      "Hamkasb, kelishilgan hisobot",
      "A colleague, the report you asked for",
    ),
    risky: false,
    why: t(
      "Kutilgan fayl, tanish yuboruvchi, oddiy PDF.",
      "An expected file from someone you know — a plain PDF.",
    ),
  },
  {
    name: "invoice.pdf.exe",
    from: t("Noma’lum yetkazib beruvchi", "An unknown supplier"),
    risky: true,
    why: t(
      "Ikki kengaytma: aslida bu PDF emas, dastur (.exe).",
      "A double extension: it isn’t a PDF but a program (.exe).",
    ),
  },
  {
    name: "family_photo.jpg",
    from: t(
      "Oila a’zosi, oldindan aytgan",
      "A relative who said they’d send it",
    ),
    risky: false,
    why: t("Kutilgan oddiy rasm.", "An expected, ordinary image."),
  },
  {
    name: "Salary_2026.docm",
    from: t(
      "“HR” — matnda “ko‘rish uchun Enable Content bosing”",
      "“HR” — the text says “click Enable Content to view”",
    ),
    risky: true,
    why: t(
      ".docm makrosli hujjat, makrosni yoqishni so‘rash — klassik tuzoq.",
      "A macro-enabled .docm asking you to enable content — a classic trap.",
    ),
  },
  {
    name: "meeting_notes.docx",
    from: t(
      "Ichki tizim, Protected View’da ochiladi",
      "The internal system — opens in Protected View",
    ),
    risky: false,
    why: t(
      "Makrossiz format va himoyalangan ko‘rinish.",
      "A macro-free format opened in a protected view.",
    ),
  },
  {
    name: "documents.zip",
    from: t(
      "Notanish manzil — parol xat matnida",
      "An unknown address — the password is in the email",
    ),
    risky: true,
    why: t(
      "Parolli arxiv pochta skanerini chetlab o‘tadi; notanishdan kelgan.",
      "A password-protected archive slips past the mail scanner, from a stranger.",
    ),
  },
  {
    name: "slides.pptx",
    from: t("Kompaniyaning umumiy diski", "The company shared drive"),
    risky: false,
    why: t(
      "Ichki manba, makrossiz format.",
      "An internal source and a macro-free format.",
    ),
  },
  {
    name: "Shipping_Label.iso → label.lnk",
    from: t("“Pochta xizmati”", "“The courier”"),
    risky: true,
    why: t(
      "ISO ichidagi yorliq (.lnk) dastur ishga tushiradi — yorliq hujjat emas.",
      "A shortcut (.lnk) inside an ISO runs a program — it isn’t a document.",
    ),
  },
];

export const RISKY = ATTACHMENTS.flatMap((a, i) => (a.risky ? [i] : []));

export const attachmentsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === RISKY.length && RISKY.every((i) => set.has(i));
};
