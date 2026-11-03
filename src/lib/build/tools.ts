// Academy Intermediate · How programs are built: the files a C compiler
// leaves behind at each stage, and where the parts of a small program end
// up inside the finished ELF file.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Stages ----------------------------------------------------------------------------

export const STAGES = [
  "you",
  "preprocessor",
  "compiler",
  "assembler",
  "linker",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_NAMES: Record<Stage, Text> = {
  you: t("Dasturchi yozadi", "Written by you"),
  preprocessor: t("Preprotsessor", "The preprocessor"),
  compiler: t("Kompilyator", "The compiler"),
  assembler: t("Assembler", "The assembler"),
  linker: t("Linker (bog‘lovchi)", "The linker"),
};

export type Artifact = { file: string; what: Text; stage: Stage };

export const ARTIFACTS: Artifact[] = [
  {
    file: "hello.c",
    what: t("C manba kodi", "C source code"),
    stage: "you",
  },
  {
    file: "hello.i",
    what: t(
      "#include va makroslar ochilgan manba",
      "Source with #include and macros expanded",
    ),
    stage: "preprocessor",
  },
  {
    file: "hello.s",
    what: t("Assembler matni", "Assembly text"),
    stage: "compiler",
  },
  {
    file: "hello.o",
    what: t(
      "Mashina kodi, lekin tashqi manzillar hali yo‘q",
      "Machine code with outside addresses still missing",
    ),
    stage: "assembler",
  },
  {
    file: "hello",
    what: t(
      "Ishga tushiriladigan fayl: kutubxonalar bilan bog‘langan",
      "The runnable program, joined to its libraries",
    ),
    stage: "linker",
  },
];

export type StagePicks = Partial<Record<string, Stage>>;

export const stagesRight = (p: StagePicks) =>
  ARTIFACTS.every((a) => p[a.file] === a.stage);

// --- Sections --------------------------------------------------------------------------

export const SECTIONS = [".text", ".rodata", ".data", ".bss"] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_NAMES: Record<Section, Text> = {
  ".text": t(".text — kod", ".text — code"),
  ".rodata": t(
    ".rodata — faqat o‘qiladigan ma’lumot",
    ".rodata — read-only data",
  ),
  ".data": t(
    ".data — boshlang‘ich qiymatli o‘zgaruvchilar",
    ".data — initialised variables",
  ),
  ".bss": t(".bss — nolga teng o‘zgaruvchilar", ".bss — zero-filled variables"),
};

export type Part = { code: string; section: Section; why: Text };

/** Pieces of hello.c and the section each lands in. */
export const PARTS: Part[] = [
  {
    code: "int main(void) { … }",
    section: ".text",
    why: t(
      "Funksiyalar — bajariladigan kod.",
      "Functions are executable code.",
    ),
  },
  {
    code: '"Hello, Toshkent!"',
    section: ".rodata",
    why: t(
      "Satr konstantasi o‘zgarmaydi — faqat o‘qish uchun.",
      "A string literal never changes — read-only.",
    ),
  },
  {
    code: "int visits = 5;",
    section: ".data",
    why: t(
      "Boshlang‘ich qiymati bor global o‘zgaruvchi faylda saqlanadi.",
      "A global with a starting value is stored in the file.",
    ),
  },
  {
    code: "char buffer[4096];",
    section: ".bss",
    why: t(
      "Nol bilan boshlanadi: faylda joy egallamaydi, faqat hajmi yoziladi.",
      "Starts as zeros: it takes no room in the file, only its size is noted.",
    ),
  },
  {
    code: "static int add(int a, int b)",
    section: ".text",
    why: t("Yordamchi funksiya ham kod.", "A helper function is code too."),
  },
];

export type SectionPicks = Partial<Record<string, Section>>;

export const sectionsRight = (p: SectionPicks) =>
  PARTS.every((x) => p[x.code] === x.section);
