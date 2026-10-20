import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anatomyIds,
  type CommonWidget,
  type Lesson,
} from "../src/lib/anim-lab/types";
import { LESSONS as HTTP_BASICS } from "../src/lib/http-basics/curriculum";
import { LESSONS as HTTPS } from "../src/lib/https-basics/curriculum";
import { LESSONS as BASH, type Log } from "../src/lib/bash-basics/curriculum";
import { emptyState, run } from "../src/lib/bash-basics/interp";
import { LESSONS as SSH } from "../src/lib/ssh-basics/curriculum";
import { PASSWORD, startSim, step, type Sim } from "../src/lib/ssh-basics/sim";
import {
  INTERCEPTED,
  SECRET,
  shift,
  unshift,
} from "../src/lib/https-basics/cipher";
import {
  answer,
  family,
  FAMILIES,
  METHODS,
  PATHS,
} from "../src/lib/http-basics/server";

// Every animated lab's lessons must be solvable: numbered 1…n, both
// languages filled in, and each shared widget internally consistent.
const LABS: Record<string, Lesson<{ type: string }>[]> = {
  "http-basics": HTTP_BASICS,
  https: HTTPS,
  bash: BASH,
  ssh: SSH,
};

const filled = (value: { uz: string; en: string }) =>
  value.uz.trim().length > 0 && value.en.trim().length > 0;

for (const [name, lessons] of Object.entries(LABS))
  test(`${name}: lessons are complete and solvable`, () => {
    lessons.forEach((lesson, i) => {
      assert.equal(lesson.id, i + 1);
      for (const text of [
        lesson.group,
        lesson.title,
        lesson.intro,
        lesson.analogy,
        lesson.task,
        lesson.hint,
        ...lesson.theory,
      ])
        assert.ok(filled(text), `${name} #${lesson.id}`);
      const widget = lesson.widget as CommonWidget;
      switch (widget.type) {
        case "sequence": {
          const ids = new Set(widget.actors.map((a) => a.id));
          assert.ok(widget.steps.length > 0);
          for (const step of widget.steps) {
            assert.ok(ids.has(step.from) && ids.has(step.to), step.label);
            assert.ok(filled(step.detail));
          }
          break;
        }
        case "anatomy": {
          const ids = anatomyIds(widget.lines);
          assert.equal(new Set(ids).size, ids.length, "part ids are unique");
          assert.deepEqual(
            [...ids].sort(),
            widget.parts.map((p) => p.id).sort(),
            `${name} #${lesson.id}: every part is explained`,
          );
          break;
        }
        case "sort": {
          const buckets = new Set(widget.buckets.map((b) => b.id));
          for (const item of widget.items)
            assert.ok(buckets.has(item.bucket), item.label.en);
          // Every bucket gets at least one card.
          for (const bucket of buckets)
            assert.ok(widget.items.some((item) => item.bucket === bucket));
          break;
        }
        case "quiz":
          for (const q of widget.questions)
            assert.ok(q.answer >= 0 && q.answer < q.options.length);
          break;
      }
    });
  });

test("http-basics: the practice server reaches every family of codes", () => {
  const seen = new Set<number>();
  for (const method of METHODS)
    for (const path of PATHS) seen.add(family(answer(method, path).status));
  assert.deepEqual([...seen].sort(), [...FAMILIES]);
  assert.equal(answer("GET", "/").status, 200);
  assert.equal(answer("POST", "/").status, 405);
  assert.equal(
    answer("GET", "/old-page").headers.find(([n]) => n === "Location")?.[1],
    "/",
  );
  // The Network panel's questions point at rows that exist.
  const panel = HTTP_BASICS.find((l) => l.widget.type === "netpanel")!.widget;
  if (panel.type !== "netpanel") return;
  const paths = new Set(panel.rows.map((r) => r.path));
  for (const q of panel.questions)
    for (const option of q.options) assert.ok(paths.has(option.en), option.en);
});

test("https: the toy cipher locks and unlocks with the same key", () => {
  assert.equal(shift("Abc xyz!", 3), "Def abc!");
  assert.equal(unshift(shift("salom dunyo", 11), 11), "salom dunyo");
  assert.equal(unshift(INTERCEPTED, SECRET.key), SECRET.plain);
  assert.notEqual(INTERCEPTED, SECRET.plain);
});

test("bash: every terminal and script goal can be met", () => {
  const terminal = (id: number, commands: string[]) => {
    const lesson = BASH[id - 1].widget;
    assert.equal(lesson.type, "shell");
    if (lesson.type !== "shell") return;
    let log: Log = { state: emptyState(lesson.files), entries: [] };
    for (const command of commands) {
      const r = run(command, log.state);
      log = {
        state: r.state,
        entries: [
          ...log.entries,
          { command, output: r.output, error: r.error },
        ],
      };
    }
    for (const goal of lesson.goals)
      assert.ok(goal.check(log), `#${id} ${goal.label.en}`);
  };
  terminal(2, ["NAME=Ali", 'echo "Salom, $NAME"']);
  terminal(4, ["A=7; B=5", "echo $((A + B))", "echo $((A * B))"]);
  terminal(6, [
    "for i in {1..5}; do echo $i; done",
    "for f in *.log; do echo $f; done",
  ]);

  const script = (
    id: number,
    edit: (source: string) => string,
    args: string[],
  ) => {
    const lesson = BASH[id - 1].widget;
    assert.equal(lesson.type, "script");
    if (lesson.type !== "script") return;
    // The starting script does not meet the goals yet.
    const before = run(lesson.source, emptyState(lesson.files, []));
    const command = `bash ${lesson.name}${args.length ? ` ${args.join(" ")}` : ""}`;
    const unsolved: Log = {
      state: before.state,
      entries: [
        {
          command: `bash ${lesson.name}`,
          output: before.output,
          error: before.error,
        },
      ],
    };
    assert.ok(
      !lesson.goals.every((g) => g.check(unsolved)),
      `#${id} starts unsolved`,
    );
    const after = run(edit(lesson.source), emptyState(lesson.files, args));
    const log: Log = {
      state: after.state,
      entries: [{ command, output: after.output, error: after.error }],
    };
    for (const goal of lesson.goals)
      assert.ok(goal.check(log), `#${id} ${goal.label.en}`);
  };
  script(7, (s) => s.replace(/  # .*\n/, "  i=$((i - 1))\n"), []);
  script(
    8,
    (s) => s.replace("for USER in root ali", "for USER in root admin ali"),
    ["auth.log"],
  );
});

test("ssh: the practice client walks every lesson's goals", () => {
  const play = (inputs: string[]) =>
    inputs.reduce<{ sim: Sim; out: string[] }>(
      (acc, input) => {
        const r = step(acc.sim, input);
        return { sim: r.sim, out: [...acc.out, ...r.lines.map((l) => l.text)] };
      },
      { sim: startSim(), out: [] },
    );
  const goals = (id: number, sim: Sim) => {
    const widget = SSH[id - 1].widget;
    assert.equal(widget.type, "ssh");
    if (widget.type !== "ssh") return;
    for (const goal of widget.goals)
      assert.ok(goal.check(sim), `#${id} ${goal.label.en}`);
  };
  const first = play([
    "ssh ali@server.uz",
    "yes",
    "wrong",
    PASSWORD,
    "hostname",
    "exit",
  ]);
  assert.ok(first.out.includes("Permission denied, please try again."));
  assert.ok(first.out.includes("web-1"));
  goals(3, first.sim);

  const keys = play([
    "ssh-keygen -t ed25519",
    "ssh-copy-id ali@server.uz",
    "yes",
    PASSWORD,
    "ssh ali@server.uz",
    "whoami",
  ]);
  assert.ok(keys.out.includes("ali"));
  goals(5, keys.sim);

  // Refusing the host key stops the connection; unknown hosts do not resolve.
  const no = play(["ssh ali@server.uz", "no"]);
  assert.equal(no.sim.mode.kind, "local");
  assert.ok(no.out.includes("Host key verification failed."));
  assert.match(
    play(["ssh ali@evil.example"]).out.at(-1) ?? "",
    /Could not resolve/,
  );
  assert.match(
    play(["ssh -p 2222 ali@server.uz"]).out.at(-1) ?? "",
    /Connection refused/,
  );
  // Three wrong passwords end the attempt.
  assert.equal(
    play(["ssh ali@server.uz", "yes", "a", "b", "c"]).sim.mode.kind,
    "local",
  );
});
