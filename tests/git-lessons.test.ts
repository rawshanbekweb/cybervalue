import { test } from "node:test";
import assert from "node:assert/strict";
import { LESSONS, type Log } from "../src/lib/git-basics/curriculum";
import { run } from "../src/lib/git-basics/sim";

// The commands a student would type for each terminal lesson.
const SOLUTIONS: Record<number, string[]> = {
  2: [
    'git config --global user.name "Ali"',
    'git config --global user.email "ali@example.uz"',
    "git init",
    "git status",
  ],
  3: [
    "git add index.html style.css",
    'git commit -m "Sayt sahifasi"',
    "git status",
  ],
  4: [
    'echo "<p>Men haqimda</p>" >> index.html',
    "git diff",
    'git commit -am "Men haqimda bo‘limi"',
    "git log --oneline",
  ],
  5: [
    'echo ".env" > .gitignore',
    "git status",
    "git add .",
    'git commit -m "Loyiha, sirlarsiz"',
  ],
  6: [
    "git switch -c login",
    'echo "<form>" > login.html',
    "git add .",
    'git commit -m "Kirish sahifasi"',
    "git switch main",
    "ls",
  ],
  7: ["git merge dizayn", "git merge footer", "git log --oneline"],
  8: [
    "git merge chegirma",
    "cat narx.txt",
    'echo "Narx: 90 000 so‘m" > narx.txt',
    "git add narx.txt",
    'git commit -m "Narx kelishildi"',
  ],
  9: [
    "git remote add origin https://github.com/ali/portfolio.git",
    "git remote -v",
    "git push -u origin main",
    "git status",
  ],
  10: [
    "git status",
    "git pull",
    "cat TODO.txt",
    'echo "- Dizayn (Ali)" >> TODO.txt',
    'git commit -am "Ali: vazifa"',
    "git push",
  ],
};

const play = (start: Log["state"], lines: string[]) => {
  let log: Log = { state: start, entries: [] };
  for (const command of lines) {
    const r = run(command, log.state);
    log = {
      state: r.state,
      entries: [...log.entries, { command, output: r.output, error: r.error }],
    };
  }
  return log;
};

test("there are twelve lessons with unique ids and both languages", () => {
  assert.equal(LESSONS.length, 12);
  assert.deepEqual(
    LESSONS.map((l) => l.id),
    Array.from({ length: 12 }, (_, i) => i + 1),
  );
  for (const l of LESSONS)
    for (const text of [
      l.title,
      l.intro,
      l.analogy,
      l.task,
      l.hint,
      ...l.theory,
    ])
      assert.ok(text.uz && text.en, `lesson ${l.id}`);
});

for (const lesson of LESSONS) {
  if (lesson.widget.type !== "git") continue;
  const widget = lesson.widget;
  test(`lesson ${lesson.id} starts unsolved and the hint commands solve it`, () => {
    const empty: Log = { state: widget.start, entries: [] };
    assert.ok(!widget.goals.every((g) => g.check(empty)), "not already solved");
    const solution = SOLUTIONS[lesson.id];
    assert.ok(solution, `a solution for lesson ${lesson.id}`);
    const log = play(widget.start, solution);
    for (const [i, goal] of widget.goals.entries())
      assert.ok(
        goal.check(log),
        `lesson ${lesson.id} goal ${i + 1}: ${goal.label.en}`,
      );
  });
}

test("the secrets lesson fails if .env is committed", () => {
  const lesson = LESSONS.find((l) => l.id === 5)!;
  assert.equal(lesson.widget.type, "git");
  if (lesson.widget.type !== "git") return;
  const log = play(lesson.widget.start, [
    "git add .",
    'git commit -m "hammasi"',
  ]);
  assert.ok(!lesson.widget.goals.every((g) => g.check(log)));
});

test("the team lesson rejects a push before pulling", () => {
  const lesson = LESSONS.find((l) => l.id === 10)!;
  if (lesson.widget.type !== "git") return assert.fail();
  const log = play(lesson.widget.start, [
    'echo "- Ali" >> TODO.txt',
    'git commit -am "Ali"',
    "git push",
  ]);
  assert.match(log.entries.at(-1)!.error!, /failed to push/);
});

test("every lesson picture exists", async () => {
  const { existsSync } = await import("node:fs");
  for (const l of LESSONS)
    for (const f of l.figures ?? [])
      assert.ok(existsSync(`public${f.src}`), f.src);
});
