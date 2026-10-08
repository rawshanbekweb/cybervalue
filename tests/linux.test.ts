import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMMANDS,
  complete,
  execute,
  HOME,
  initialShell,
  resolvePath,
  restoreShell,
  type Event,
} from "../src/lib/linux/engine";
import { checks, COMMAND_NOTES, LESSONS } from "../src/lib/linux/curriculum";
import { restoreProgress, restoreSession } from "../src/lib/linux/storage";
import { createTranslator } from "../src/lib/i18n";

test("all 16 lessons have achievable tasks, valid quizzes and translated catalog entries", () => {
  assert.equal(LESSONS.length, 16);
  const translate = createTranslator("uz");
  for (const [index, lesson] of LESSONS.entries()) {
    assert.equal(lesson.id, index + 1);
    assert.notEqual(translate(lesson.title.en), lesson.title.en);
    assert.ok(lesson.quiz.choices[lesson.quiz.answer]);
    let shell = initialShell();
    const events: Event[] = [];
    assert.ok(
      checks(lesson, shell, events).some((c) => !c.passed),
      `lesson ${lesson.id} is not pre-completed`,
    );
    for (const hint of lesson.hint) {
      const result = execute(shell, hint);
      assert.equal(result.code, 0, `${lesson.id}: ${hint}\n${result.output}`);
      shell = result.shell;
      events.push(...result.events);
    }
    assert.ok(
      checks(lesson, shell, events).every((c) => c.passed),
      `lesson ${lesson.id}: ${JSON.stringify(checks(lesson, shell, events))}`,
    );
  }
  assert.deepEqual(
    Object.keys(COMMANDS).sort(),
    Object.keys(COMMAND_NOTES).sort(),
  );
});

test("shell handles relative paths, spaces, hidden names and cd -", () => {
  assert.equal(resolvePath(HOME, "../../../etc/./../tmp"), "/tmp");
  const run = execute(
    initialShell(),
    "mkdir 'my notes' && cd 'my notes' && echo hello > 'a file.txt'; cat 'a file.txt'; cd -; ls -a",
  );
  assert.equal(run.code, 0);
  assert.equal(run.shell.cwd, HOME);
  assert.equal(
    run.shell.files[HOME + "/my notes/a file.txt"].content,
    "hello\n",
  );
  assert.match(run.output, /hello/);
  assert.match(run.output, /\.secret/);
});

test("quoted operators and variables stay data, control lists expand after export", () => {
  const result = execute(
    initialShell(),
    `export COURSE="Linux basics"; echo "$COURSE"; echo '$COURSE'; echo "a | b > c && d"; echo escaped\\ word`,
  );
  assert.equal(
    result.output,
    "Linux basics\n$COURSE\na | b > c && d\nescaped word\n",
  );
  assert.equal(result.code, 0);
  assert.equal(execute(initialShell(), "echo $__proto__").output, "\n");
  assert.equal(execute(initialShell(), "export __proto__=broken").code, 1);
  assert.equal(execute(initialShell(), "echo $(pwd)").code, 2);
});

test("syntax failures do not perform preceding mutations, && short circuits", () => {
  for (const input of [
    "touch unwanted; echo >",
    "touch unwanted |",
    "touch unwanted &&",
    "touch unwanted; echo 'broken",
  ]) {
    const result = execute(initialShell(), input);
    assert.equal(result.code, 2, input);
    assert.equal(result.shell.files[HOME + "/unwanted"], undefined);
  }
  const result = execute(
    initialShell(),
    "cat missing && touch skipped; echo recovered",
  );
  assert.equal(result.shell.files[HOME + "/skipped"], undefined);
  assert.equal(result.code, 0);
  assert.match(result.output, /recovered/);
});

test("redirection truncates before reading, append preserves and input redirect works", () => {
  let result = execute(
    initialShell(),
    "echo one > sample; echo two >> sample; cat < sample",
  );
  assert.equal(result.output, "one\ntwo\n");
  result = execute(result.shell, "cat sample > sample");
  assert.equal(result.shell.files[HOME + "/sample"].content, "");
  result = execute(result.shell, "echo data > /etc/hostname");
  assert.notEqual(result.code, 0);
  assert.equal(result.shell.files["/etc/hostname"].content, "linux-lab\n");
});

test("pipelines transform real content and separate errors from stdout", () => {
  const result = execute(
    initialShell(),
    "cat documents/users.txt | sort | uniq -c",
  );
  assert.equal(result.output, "2 ali\n2 sara\n1 zafar\n");
  assert.equal(
    execute(initialShell(), "grep -F ERROR logs/auth.log | wc -l").output,
    "2\n",
  );
  const error = execute(initialShell(), "cat missing | wc -l");
  assert.match(error.output, /No such file/);
  assert.match(error.output, /0\n$/);
  assert.equal(error.code, 0); // Pipeline status is the final command's status.
  assert.equal(execute(initialShell(), "cd /etc | cat").shell.cwd, HOME);
  assert.equal(
    execute(initialShell(), "export COURSE=x | cat").shell.env.COURSE,
    undefined,
  );
});

test("grep options, no-match status and unsupported regular expressions are honest", () => {
  const initial = initialShell();
  assert.match(
    execute(initial, "grep -Fin error logs/auth.log").output,
    /^2:ERROR/,
  );
  assert.equal(execute(initial, "grep -Fvc ERROR logs/auth.log").output, "3\n");
  assert.equal(execute(initial, "grep -F absent logs/auth.log").code, 1);
  assert.match(
    execute(initial, "grep '.*' logs/auth.log").output,
    /not implemented/,
  );
  assert.equal(
    execute(initial, "grep -F ERROR logs/auth.log > errors").shell.files[
      HOME + "/errors"
    ].content.split("\n").length,
    3,
  );
});

test("head/tail preserve unterminated lines; wc counts newlines and UTF-8 bytes", () => {
  const shell = execute(initialShell(), 'echo -n "salom" > sample').shell;
  assert.equal(execute(shell, "head -n 1 sample").output, "salom");
  assert.equal(execute(shell, "tail -n 1 sample").output, "salom");
  assert.equal(execute(shell, "tail -n 0 sample").output, "");
  assert.equal(execute(shell, "cat sample | wc -l").output, "0\n");
  assert.equal(execute(shell, 'echo -n "é" | wc -c').output, "2\n");
  assert.equal(execute(shell, "head -n nope sample").code, 1);
});

test("copy, move and remove directories preserve expected file state", () => {
  let result = execute(
    initialShell(),
    "cp -r documents copy; mv copy archive; rm -r archive",
  );
  assert.equal(result.code, 0);
  assert.ok(result.shell.files[HOME + "/documents/notes.txt"]);
  assert.equal(result.shell.files[HOME + "/archive"], undefined);
  result = execute(initialShell(), "cp -r documents documents/nested");
  assert.equal(result.code, 1);
  assert.equal(result.shell.files[HOME + "/documents/nested"], undefined);
  assert.equal(execute(initialShell(), "rmdir documents").code, 1);
  assert.equal(execute(initialShell(), "rm -f missing").code, 0);
  assert.notEqual(execute(initialShell(), "rm -rf /").code, 0);
});

test("owner permissions affect reads, writes and traversal; parent controls removal", () => {
  let shell = execute(initialShell(), "chmod 000 documents/notes.txt").shell;
  assert.match(
    execute(shell, "cat documents/notes.txt").output,
    /Permission denied/,
  );
  assert.equal(execute(shell, "echo x > documents/notes.txt").code, 1);
  assert.equal(execute(shell, "rm documents/notes.txt").code, 0);
  shell = execute(initialShell(), "chmod 600 documents").shell;
  assert.equal(execute(shell, "cd documents").code, 1);
  assert.equal(execute(shell, "cat documents/notes.txt").code, 1);
  assert.equal(
    execute(shell, "chmod 755 documents; cat documents/notes.txt").code,
    0,
  );
});

test("find matches only the requested name/type and handles metacharacters literally", () => {
  assert.equal(
    execute(initialShell(), "find . -name '*.log' -type f").output,
    "./logs/auth.log\n",
  );
  assert.equal(
    execute(initialShell(), "find documents -name 'notes.???'").output,
    "documents/notes.txt\n",
  );
  assert.equal(
    execute(initialShell(), "find . -name '[x]' -type f").output,
    "",
  );
  assert.equal(execute(initialShell(), "find . -type nope").code, 1);
});

test("process fixtures, completion and command limits are enforced", () => {
  const result = execute(initialShell(), "kill 128; ps");
  assert.doesNotMatch(result.output, /backup-worker/);
  assert.ok(result.shell.processes.includes(1));
  assert.equal(execute(initialShell(), "kill 1").code, 1);
  assert.deepEqual(complete(initialShell(), "pw"), ["pwd"]);
  assert.deepEqual(complete(initialShell(), "cat doc"), ["documents/"]);
  assert.deepEqual(complete(initialShell(), "cat documents/no"), [
    "documents/notes.txt",
  ]);
  assert.equal(execute(initialShell(), "x".repeat(2001)).code, 2);
  assert.match(
    execute(initialShell(), "sudo apt install anything").output,
    /command not found/,
  );
});

test("restoring browser storage rejects bad shape, paths, modes and forged progress ids", () => {
  for (const value of [null, [], 42, { files: [] }, { shell: null }]) {
    assert.equal(restoreShell(value).cwd, HOME);
    assert.equal(restoreSession(value).shell.cwd, HOME);
  }
  const bad = initialShell();
  bad.files["/home/student/../bad"] = {
    kind: "file",
    mode: 0o644,
    content: "x",
  };
  assert.equal(restoreShell(bad).files["/home/student/../bad"], undefined);
  const invalid = initialShell();
  invalid.files[HOME].mode = -1;
  assert.equal(restoreShell(invalid).files[HOME].mode, 0o755);
  const valid = execute(
    initialShell(),
    "echo persistent > saved; export COURSE=Linux; kill 128",
  ).shell;
  assert.deepEqual(restoreShell(JSON.parse(JSON.stringify(valid))), valid);
  assert.deepEqual(
    restoreProgress(
      { 1: true, 2: "true", 3: 1, 16: true, 17: true, nope: true },
      16,
    ),
    { 1: true, 16: true },
  );
  assert.equal(
    restoreSession({
      shell: valid,
      events: [null, { args: 2 }],
      transcript: [false],
      answer: 88,
      draft: 42,
    }).events.length,
    0,
  );
});
