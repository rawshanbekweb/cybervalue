// Lesson progress of the four track labs, kept in the browser and, for a
// signed-in student, mirrored on the server so it follows them between
// devices and shows on their page. Each lab stores { "<lesson id>": true }.

export const LAB_PROGRESS = {
  network: { key: "cybervalue:network:progress:v1", total: 17 },
  linux: { key: "cybervalue:linux:progress:v1", total: 16 },
  html: { key: "htmldars:progress:v1", total: 12 },
  security: { key: "sabaq:progress:v1", total: 36 },
} as const;

export type LabId = keyof typeof LAB_PROGRESS;

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
