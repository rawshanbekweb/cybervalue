import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyState, run } from "../src/lib/bash-basics/interp";

const sh = (source: string, files = {}, args: string[] = []) =>
  run(source, emptyState(files, args));

test("variables, quotes and arithmetic", () => {
  const r = sh(
    `NAME=Ali\necho "Salom, $NAME!"\necho 'Salom, $NAME!'\nA=4; B=3\necho $((A * B + 1))`,
  );
  assert.equal(r.error, null);
  assert.deepEqual(r.output, ["Salom, Ali!", "Salom, $NAME!", "13"]);
  assert.equal(r.state.vars.NAME, "Ali");
  assert.deepEqual(r.assigned, ["NAME", "A", "B"]);
});

test("for loops over lists, ranges and files", () => {
  assert.deepEqual(sh("for i in 1 2 3; do echo $i; done").output, [
    "1",
    "2",
    "3",
  ]);
  assert.deepEqual(sh("for n in {1..4}; do echo $((n * n)); done").output, [
    "1",
    "4",
    "9",
    "16",
  ]);
  assert.deepEqual(
    sh("for f in *.log; do echo $f; done", {
      "a.log": "",
      "b.txt": "",
      "c.log": "",
    }).output,
    ["a.log", "c.log"],
  );
});

test("while, until and if with tests", () => {
  assert.deepEqual(
    sh(
      "i=3\nwhile [ $i -gt 0 ]; do\n  echo $i\n  i=$((i - 1))\ndone\necho Start!",
    ).output,
    ["3", "2", "1", "Start!"],
  );
  assert.deepEqual(
    sh("n=1; until [ $n -ge 3 ]; do echo $n; n=$((n+1)); done").output,
    ["1", "2"],
  );
  const grade = (score: number) =>
    sh(
      `S=${score}\nif [ $S -ge 85 ]; then echo alo\nelif [ $S -ge 60 ]; then echo yaxshi\nelse echo qayta\nfi`,
    ).output[0];
  assert.equal(grade(90), "alo");
  assert.equal(grade(70), "yaxshi");
  assert.equal(grade(10), "qayta");
});

test("script arguments, files, grep and redirection", () => {
  const files = { "auth.log": "ok ali\nFAILED root\nok vali\nFAILED admin\n" };
  const r = sh(
    `echo "Args: $#, first: $1"\nN=$(( $# + 1 ))\necho $N\ngrep -c FAILED auth.log\ngrep FAILED auth.log > report.txt\ncat report.txt\n[ -f report.txt ] && echo yes`,
    files,
    ["auth.log", "x"],
  );
  assert.deepEqual(r.output.slice(0, 5), [
    "Args: 2, first: auth.log",
    "3",
    "2",
    "FAILED root",
    "FAILED admin",
  ]);
  assert.equal(r.error, null);
  assert.equal(r.output.at(-1), "yes");
  assert.equal(r.state.files["report.txt"], "FAILED root\nFAILED admin\n");
  assert.deepEqual(sh("false || echo plan-b; true && echo ok").output, [
    "plan-b",
    "ok",
  ]);
});

test("errors are reported, endless loops stop", () => {
  assert.match(sh("ech hi").error ?? "", /command not found/);
  assert.match(sh("for i in 1 2; do echo $i").error ?? "", /missing “done”/);
  assert.match(
    sh("while true; do echo x; done").error ?? "",
    /too many steps|too much output/,
  );
  assert.match(sh("[ abc -lt 3 ]").error ?? "", /integer expression expected/);
  assert.equal(sh("echo $((7 / 0))").error, "bash: division by 0");
});
