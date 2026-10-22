import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS, mazeSolved, parseMaze, runMaze } from "../src/lib/kids/maze";

const SOLUTIONS: Record<string, string> = {
  l1: "oldinga(4)",
  l2: "oldinga(2)\nongga()\noldinga(3)",
  l3: "oldinga()\nongga()\noldinga(2)\nchapga()\noldinga(3)",
  l4: "oldinga(3)\nchapga()\noldinga(2)\nchapga()\noldinga(3)",
  l5: "takrorla 5:\n    oldinga()\n    chapga()\n    oldinga()\n    ongga()",
  l6: "takrorla 3:\n    oldinga(2)\n    ongga()\n    oldinga(2)\n    chapga()",
  l7: "takrorla 3:\n    oldinga(4)\n    ongga()",
  l8: "toki chiqishda_emas:\n    agar oldinda_devor bo'lsa:\n        ongga()\n    aks_holda:\n        oldinga()",
  l9: "toki chiqishda_emas:\n    agar oldinda_devor bo'lsa:\n        chapga()\n    aks_holda:\n        oldinga()",
  l10: `toki chiqishda_emas:
    agar chapda_yo'l bo'lsa:
        chapga()
        oldinga()
    aks_holda:
        agar oldinda_yo'l bo'lsa:
            oldinga()
        aks_holda:
            ongga()`,
  l11: "takrorla 2:\n    oldinga(2)\n    ongga()\n    oldinga(2)\n    ongga()\n    oldinga(2)\n    chapga()\n    oldinga(2)\n    chapga()",
  l12: "toki chiqishda_emas:\n    agar ongda_yo'l bo'lsa:\n        ongga()\n        oldinga()\n    aks_holda:\n        agar oldinda_yo'l bo'lsa:\n            oldinga()\n        aks_holda:\n            chapga()",
  l13: "toki chiqishda_emas:\n    agar ongda_yo'l bo'lsa:\n        ongga()\n        oldinga()\n    aks_holda:\n        agar oldinda_yo'l bo'lsa:\n            oldinga()\n        aks_holda:\n            chapga()",
};

test("every level is solved by its solution", () => {
  for (const [id, level] of Object.entries(LEVELS)) {
    const program = parseMaze(SOLUTIONS[id]);
    assert.deepEqual(program.problems, [], id);
    assert.equal(runMaze(program.nodes, level).outcome, "exit", id);
  }
});

test("walls stop the robot, and running out of commands is not a win", () => {
  assert.equal(
    runMaze(parseMaze("oldinga(9)").nodes, LEVELS.l2).outcome,
    "wall",
  );
  assert.equal(
    runMaze(parseMaze("oldinga(2)").nodes, LEVELS.l1).outcome,
    "ended",
  );
  const spin = runMaze(
    parseMaze("toki chiqishda_emas:\n    ongga()").nodes,
    LEVELS.l1,
  );
  assert.equal(spin.outcome, "too-long");
});

test("levels can demand loops, conditions and short code", () => {
  const flat = "oldinga(4)\nongga()\noldinga(4)\nongga()\noldinga(4)";
  assert.equal(runMaze(parseMaze(flat).nodes, LEVELS.l7).outcome, "exit");
  assert.ok(!mazeSolved(flat, LEVELS.l7, { needs: { loop: true } }));
  assert.ok(
    mazeSolved(SOLUTIONS.l7, LEVELS.l7, { needs: { loop: true }, maxLines: 3 }),
  );
  assert.ok(!mazeSolved(SOLUTIONS.l7, LEVELS.l7, { maxLines: 2 }));
  assert.ok(
    mazeSolved(SOLUTIONS.l8, LEVELS.l8, { needs: { while: true, if: true } }),
  );
});

test("mistakes get line numbers and suggestions", () => {
  const program = parseMaze(
    [
      "oldinge(2)",
      "agar oldinda_devr bo'lsa:",
      "agar oldinda_devor bo'lsa:",
      "    ongga()",
      "aks_holda:",
      "oldinga(30)",
      "  aks_holda:",
    ].join("\n"),
  );
  const byLine = Object.fromEntries(
    program.problems.map((p) => [p.line, p.message.uz]),
  );
  assert.match(byLine[1], /Balki “oldinga”/);
  assert.match(byLine[2], /Balki “oldinda_devor”/);
  assert.match(byLine[5], /bo‘sh/);
  assert.match(byLine[6], /1 dan 20/);
  assert.match(byLine[7], /aks_holda/);
});
