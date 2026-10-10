import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildResults,
  cellText,
  resultsCsv,
  toCsv,
  type ResultMaterial,
  type ResultStudent,
} from "../src/lib/student/results";
import { createTranslator } from "../src/lib/i18n";

const student = (id: string, group: string): ResultStudent => ({
  id,
  name: id.toUpperCase(),
  group,
  active: true,
  lastLoginAt: null,
});
const material = (
  id: string,
  kind: ResultMaterial["kind"],
  groups: string[] = [],
): ResultMaterial => ({ id, title: id, kind, groups });

const materials = [
  material("lesson", "LESSON"),
  material("practice", "PRACTICE"),
  material("quiz", "QUIZ"),
  material("lab", "CHALLENGE"),
  material("b-only", "LAB", ["B"]),
];
const sub = (
  studentId: string,
  materialId: string,
  score: number | null,
  maxScore: number | null,
  reviewed = false,
) => ({
  studentId,
  materialId,
  score,
  maxScore,
  reviewedAt: reviewed ? new Date() : null,
});

test("the results matrix mirrors what each student completed", () => {
  const { rows, columns } = buildResults({
    students: [student("a", "A"), student("b", "B")],
    materials,
    submissions: [
      // Newest first, as loaded.
      sub("a", "practice", 80, 100, true),
      sub("a", "quiz", 2, 4, false),
      sub("a", "quiz", 4, 4, false),
      sub("a", "lab", 1, 1),
      sub("a", "lab", 0, 1),
      sub("b", "practice", null, null),
      sub("b", "lab", 0, 1),
    ],
    progress: [
      { studentId: "a", materialId: "lesson" },
      { studentId: "a", materialId: "lab" },
    ],
  });
  const [a, b] = rows;
  assert.deepEqual(a.cells, [
    { state: "done" },
    { state: "reviewed", score: 80 },
    { state: "scored", percent: 100, attempts: 2 },
    { state: "solved", attempts: 2 },
    { state: "hidden" },
  ]);
  assert.equal(a.completed, 4);
  assert.equal(a.available, 4);
  assert.equal(a.average, 90);

  assert.deepEqual(b.cells, [
    { state: "none" },
    { state: "waiting", count: 1 },
    { state: "none" },
    { state: "trying", attempts: 1 },
    { state: "none" },
  ]);
  assert.equal(b.completed, 1);
  assert.equal(b.available, 5);
  assert.equal(b.average, null);

  assert.deepEqual(
    columns.map((c) => `${c.completed}/${c.available}`),
    ["1/2", "2/2", "1/2", "1/2", "0/1"],
  );
});

test("cells read clearly in both languages", () => {
  const uz = createTranslator("uz");
  assert.equal(cellText({ state: "done" }, uz), "✓");
  assert.equal(cellText({ state: "hidden" }, uz), "");
  assert.equal(
    cellText({ state: "waiting", count: 2 }, uz),
    "Baholanmagan (2)",
  );
  assert.equal(
    cellText({ state: "waiting", count: 2 }, createTranslator("en")),
    "To review (2)",
  );
  assert.equal(
    cellText({ state: "scored", percent: 75, attempts: 3 }, uz),
    "75% (3)",
  );
  assert.equal(cellText({ state: "trying", attempts: 4 }, uz), "✗ (4)");
});

test("CSV export is spreadsheet-safe and keeps Uzbek letters", () => {
  const csv = toCsv([
    ['=HYPERLINK("x")', "+1", "-2", "@cmd", 'O‘g‘il "Ali"', null],
  ]);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(
    csv.slice(1),
    `"'=HYPERLINK(""x"")","'+1","'-2","'@cmd","O‘g‘il ""Ali""",""`,
  );

  const results = buildResults({
    students: [{ ...student("a", "9-A"), name: "Ali Valiyev" }],
    materials: [material("Kirish darsi", "LESSON")],
    submissions: [],
    progress: [{ studentId: "a", materialId: "Kirish darsi" }],
  });
  const lines = resultsCsv(results, createTranslator("uz"))
    .slice(1)
    .split("\r\n");
  assert.equal(
    lines[0],
    `"Ism","Guruh","Yakunlangan","O‘rtacha ball","Oxirgi kirish","Kirish darsi"`,
  );
  assert.equal(lines[1], `"Ali Valiyev","9-A","1/1","","","✓"`);
});
