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
import { suggestLevel, visibleAtLevel } from "../src/lib/student/levels";

const student = (id: string, group: string): ResultStudent => ({
  id,
  name: id.toUpperCase(),
  group,
  level: "",
  active: true,
  lastLoginAt: null,
});
const material = (
  id: string,
  kind: ResultMaterial["kind"],
  groups: string[] = [],
): ResultMaterial => ({
  id,
  slug: id,
  title: id,
  kind,
  groups,
  levels: [],
});

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
    `"Ism","Guruh","Daraja","Tavsiya etilgan daraja","Yakunlangan","O‘rtacha ball","Oxirgi kirish","Kirish darsi"`,
  );
  assert.equal(lines[1], `"Ali Valiyev","9-A","","","1/1","","","✓"`);
});

test("the entrance exam suggests a level from the test and the labs", () => {
  const level = (testPercent: number | null, labsSolved: number) =>
    suggestLevel({ testPercent, labsSolved, labsTotal: 2 });
  assert.equal(level(null, 2), null);
  assert.equal(level(40, 2), "beginner");
  assert.equal(level(80, 0), "beginner");
  assert.equal(level(60, 1), "intermediate");
  assert.equal(level(96, 1), "intermediate");
  assert.equal(level(88, 2), "advanced");
  assert.equal(
    suggestLevel({ testPercent: 72, labsSolved: 0, labsTotal: 0 }),
    "intermediate",
  );
  assert.ok(visibleAtLevel([], ""));
  assert.ok(visibleAtLevel(["advanced"], "advanced"));
  assert.ok(!visibleAtLevel(["advanced"], ""));
  assert.ok(!visibleAtLevel(["advanced"], "beginner"));
});

test("results suggest a level from entrance materials and hide other levels", () => {
  const entrance = [
    { ...material("t", "QUIZ"), slug: "kirish-sinovi-test" },
    { ...material("l1", "CHALLENGE"), slug: "kirish-sinovi-a" },
    { ...material("l2", "CHALLENGE"), slug: "kirish-sinovi-b" },
    { ...material("adv", "LAB"), levels: ["advanced"] },
  ];
  const { rows } = buildResults({
    students: [
      student("a", "A"),
      { ...student("b", "A"), level: "advanced" },
      student("c", "A"),
    ],
    materials: entrance,
    submissions: [
      sub("a", "t", 23, 25),
      sub("a", "l1", null, null),
      sub("b", "t", 12, 25),
      sub("b", "t", 16, 25),
      sub("b", "l1", null, null),
    ],
    progress: [
      { studentId: "a", materialId: "l1" },
      { studentId: "a", materialId: "l2" },
      { studentId: "b", materialId: "l1" },
    ],
  });
  assert.deepEqual(
    rows.map((r) => r.suggested),
    ["advanced", "intermediate", null],
  );
  // Only the placed advanced student sees the advanced lab.
  assert.deepEqual(
    rows.map((r) => r.cells[3].state),
    ["hidden", "none", "hidden"],
  );
});
