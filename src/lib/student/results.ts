import type { Translator } from "../i18n";

// Builds the admin's class matrix: one row per student, one column per
// published material, with the same notion of "completed" the student sees.

type Kind = "LESSON" | "LAB" | "PRACTICE" | "QUIZ" | "CHALLENGE";
export type ResultMaterial = {
  id: string;
  title: string;
  kind: Kind;
  groups: string[];
};
export type ResultStudent = {
  id: string;
  name: string;
  group: string;
  active: boolean;
  lastLoginAt: Date | null;
};
export type ResultSubmission = {
  studentId: string;
  materialId: string;
  score: number | null;
  maxScore: number | null;
  reviewedAt: Date | null;
};
export type ResultProgress = { studentId: string; materialId: string };

export type Cell =
  | { state: "hidden" }
  | { state: "none" }
  | { state: "done" }
  | { state: "waiting"; count: number }
  | { state: "reviewed"; score: number | null }
  | { state: "scored"; percent: number; attempts: number }
  | { state: "solved"; attempts: number }
  | { state: "trying"; attempts: number };

export type ResultRow = {
  student: ResultStudent;
  cells: Cell[];
  completed: number;
  available: number;
  // Mean of quiz best scores and reviewed practice scores, in percent.
  average: number | null;
};

const percent = (score: number, max: number) =>
  max > 0 ? Math.round((score / max) * 100) : 0;

export const visibleToGroup = (material: ResultMaterial, group: string) =>
  material.groups.length === 0 || material.groups.includes(group);

function cellFor(
  material: ResultMaterial,
  done: boolean,
  tries: ResultSubmission[],
): Cell {
  switch (material.kind) {
    case "LESSON":
    case "LAB":
      return done ? { state: "done" } : { state: "none" };
    case "PRACTICE": {
      if (!tries.length) return { state: "none" };
      const reviewed = tries.filter((s) => s.reviewedAt);
      if (reviewed.length < tries.length)
        return { state: "waiting", count: tries.length - reviewed.length };
      // The latest review counts; tries arrive newest first.
      return { state: "reviewed", score: reviewed[0].score };
    }
    case "QUIZ": {
      if (!tries.length) return { state: "none" };
      const best = Math.max(
        ...tries.map((s) => percent(s.score ?? 0, s.maxScore ?? 0)),
      );
      return { state: "scored", percent: best, attempts: tries.length };
    }
    case "CHALLENGE":
      if (done) return { state: "solved", attempts: tries.length };
      return tries.length
        ? { state: "trying", attempts: tries.length }
        : { state: "none" };
  }
}

const isComplete = (cell: Cell) =>
  ["done", "waiting", "reviewed", "scored", "solved"].includes(cell.state);

export function buildResults({
  students,
  materials,
  submissions,
  progress,
}: {
  students: ResultStudent[];
  materials: ResultMaterial[];
  submissions: ResultSubmission[];
  progress: ResultProgress[];
}) {
  const key = (studentId: string, materialId: string) =>
    `${studentId}\u0000${materialId}`;
  const done = new Set(progress.map((p) => key(p.studentId, p.materialId)));
  const tries = Map.groupBy(submissions, (s) => key(s.studentId, s.materialId));

  const rows: ResultRow[] = students.map((student) => {
    const scores: number[] = [];
    const cells = materials.map((material) => {
      if (!visibleToGroup(material, student.group))
        return { state: "hidden" } as const;
      const cell = cellFor(
        material,
        done.has(key(student.id, material.id)),
        tries.get(key(student.id, material.id)) ?? [],
      );
      if (cell.state === "scored") scores.push(cell.percent);
      if (cell.state === "reviewed" && cell.score !== null)
        scores.push(cell.score);
      return cell;
    });
    const shown = cells.filter((c) => c.state !== "hidden");
    return {
      student,
      cells,
      completed: shown.filter(isComplete).length,
      available: shown.length,
      average: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    };
  });

  const columns = materials.map((material, i) => {
    const shown = rows.filter((r) => r.cells[i].state !== "hidden");
    return {
      material,
      completed: shown.filter((r) => isComplete(r.cells[i])).length,
      available: shown.length,
    };
  });
  return { rows, columns };
}

export function cellText(cell: Cell, t: Translator) {
  switch (cell.state) {
    case "hidden":
      return "";
    case "none":
      return "—";
    case "done":
      return "✓";
    case "waiting":
      return t("To review ({count})", { count: cell.count });
    case "reviewed":
      return cell.score === null ? "✓" : `${cell.score}`;
    case "scored":
      return `${cell.percent}% (${cell.attempts})`;
    case "solved":
      return `✓ (${cell.attempts})`;
    case "trying":
      return `✗ (${cell.attempts})`;
  }
}

// Spreadsheet-safe CSV: quoted cells, formula prefixes neutralised, BOM so
// Excel reads UTF-8 names correctly.
export function toCsv(rows: unknown[][]) {
  const cell = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

export function resultsCsv(
  { rows, columns }: ReturnType<typeof buildResults>,
  t: Translator,
) {
  return toCsv([
    [
      t("Name"),
      t("Group"),
      t("Completed"),
      t("Average score"),
      t("Last sign-in"),
      ...columns.map((c) => c.material.title),
    ],
    ...rows.map((row) => [
      row.student.name,
      row.student.group,
      `${row.completed}/${row.available}`,
      row.average === null ? "" : `${row.average}%`,
      row.student.lastLoginAt?.toISOString().slice(0, 16).replace("T", " ") ??
        "",
      ...row.cells.map((cell) => cellText(cell, t)),
    ]),
  ]);
}
