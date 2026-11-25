import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  fileStatus,
  run,
  runAll,
  words,
  type State,
} from "../src/lib/git-basics/sim";

const exec = (state: State, line: string) => run(line, state);

test("words keeps quoted text together", () => {
  assert.deepEqual(words('git commit -m "birinchi commit"'), [
    "git",
    "commit",
    "-m",
    "birinchi commit",
  ]);
  assert.deepEqual(words("echo ''"), ["echo", ""]);
});

test("git needs a repository, then init makes one", () => {
  const s = emptyState();
  assert.match(exec(s, "git status").error!, /not a git repository/);
  const r = exec(s, "git init");
  assert.equal(r.error, null);
  assert.match(r.output[0], /Initialized empty Git repository/);
  assert.match(exec(r.state, "git status").output.join("\n"), /No commits yet/);
});

test("the three areas: untracked, staged, committed", () => {
  let s = runAll(["git init", 'echo "Salom" > README.md']);
  assert.deepEqual(fileStatus(s).untracked, ["README.md"]);
  s = runAll(["git add README.md"], s);
  assert.deepEqual(fileStatus(s).staged, [
    { path: "README.md", kind: "new file" },
  ]);
  const r = exec(s, 'git commit -m "README qo‘shildi"');
  assert.equal(r.error, null);
  assert.match(
    r.output[0],
    /^\[main \(root-commit\) [0-9a-f]{7}\] README qo‘shildi$/,
  );
  assert.match(
    exec(r.state, "git status").output.join("\n"),
    /working tree clean/,
  );
  // A change shows as unstaged until it is added again.
  const changed = runAll(['echo "Yangi qator" >> README.md'], r.state);
  assert.deepEqual(fileStatus(changed).unstaged, [
    { path: "README.md", kind: "modified" },
  ]);
  const diff = exec(changed, "git diff").output;
  assert.ok(diff.includes("+Yangi qator"));
  assert.ok(diff.includes(" Salom"));
});

test("a commit needs a message, changes and an identity", () => {
  let s = runAll(["git init", "touch a.txt"]);
  assert.match(exec(s, 'git commit -m "x"').error!, /no changes added/);
  s = runAll(["git add a.txt"], s);
  assert.match(exec(s, "git commit").error!, /empty commit message/);
  const anon = { ...s, user: null };
  assert.match(
    exec(anon, 'git commit -m "x"').error!,
    /Author identity unknown/,
  );
  const named = runAll(
    [
      'git config --global user.name "Vali"',
      'git config --global user.email "v@x.uz"',
    ],
    anon,
  );
  assert.equal(exec(named, 'git commit -m "x"').error, null);
});

test("log lists commits newest first with branch labels", () => {
  const s = runAll([
    "git init",
    'echo "1" > a.txt',
    "git add .",
    'git commit -m "birinchi"',
    'echo "2" >> a.txt',
    'git commit -am "ikkinchi"',
  ]);
  const log = exec(s, "git log --oneline").output;
  assert.equal(log.length, 2);
  assert.match(log[0], /^[0-9a-f]{7} \(HEAD -> main\) ikkinchi$/);
  assert.match(log[1], /^[0-9a-f]{7} birinchi$/);
});

test(".gitignore keeps secrets out of git add .", () => {
  const s = runAll([
    "git init",
    'echo "DB_PASSWORD=Qwerty123" > .env',
    'echo "print(1)" > app.py',
    'echo ".env" > .gitignore',
    "git add .",
  ]);
  const { staged, untracked } = fileStatus(s);
  assert.deepEqual(
    staged.map((x) => x.path),
    [".gitignore", "app.py"],
  );
  assert.deepEqual(untracked, []);
  assert.match(exec(s, "git add .env").error!, /ignored/);
});

test("branches: create, switch, and a fast-forward merge", () => {
  let s = runAll([
    "git init",
    'echo "bosh sahifa" > index.html',
    "git add .",
    'git commit -m "sayt"',
    "git switch -c dizayn",
    'echo "body{}" > style.css',
    "git add .",
    'git commit -m "dizayn"',
  ]);
  assert.equal(s.repo!.head, "dizayn");
  s = runAll(["git switch main"], s);
  assert.ok(!("style.css" in s.files), "main does not have the new file yet");
  const r = exec(s, "git merge dizayn");
  assert.equal(r.error, null);
  assert.ok(r.output.includes("Fast-forward"));
  assert.ok("style.css" in r.state.files);
  assert.equal(r.state.repo!.branches.main, r.state.repo!.branches.dizayn);
});

test("diverged branches make a merge commit with two parents", () => {
  const s = runAll([
    "git init",
    'echo "a" > a.txt',
    "git add .",
    'git commit -m "boshlash"',
    "git switch -c funksiya",
    'echo "b" > b.txt',
    "git add .",
    'git commit -m "b fayl"',
    "git switch main",
    'echo "c" > c.txt',
    "git add .",
    'git commit -m "c fayl"',
    "git merge funksiya",
  ]);
  const head = s.repo!.commits[s.repo!.branches.main];
  assert.equal(head.parents.length, 2);
  assert.match(head.message, /Merge branch 'funksiya'/);
  assert.deepEqual(Object.keys(s.files).sort(), ["a.txt", "b.txt", "c.txt"]);
});

test("a conflict stops the merge until the file is fixed and committed", () => {
  let s = runAll([
    "git init",
    'echo "Narx: 100" > narx.txt',
    "git add .",
    'git commit -m "narx"',
    "git switch -c chegirma",
    'echo "Narx: 80" > narx.txt',
    'git commit -am "chegirma"',
    "git switch main",
    'echo "Narx: 120" > narx.txt',
    'git commit -am "qimmat"',
  ]);
  const r = exec(s, "git merge chegirma");
  assert.match(r.error!, /Automatic merge failed/);
  assert.ok(
    r.output.includes("CONFLICT (content): Merge conflict in narx.txt"),
  );
  s = r.state;
  assert.match(
    s.files["narx.txt"],
    /<<<<<<< HEAD\nNarx: 120\n=======\nNarx: 80\n>>>>>>> chegirma/,
  );
  assert.match(
    exec(s, "git status").output.join("\n"),
    /both modified: {3}narx.txt/,
  );
  assert.match(exec(s, 'git commit -am "x"').error!, /unmerged files/);
  s = runAll(
    [
      'echo "Narx: 90" > narx.txt',
      "git add narx.txt",
      'git commit -m "kelishildi"',
    ],
    s,
  );
  assert.equal(s.merging, null);
  assert.equal(s.repo!.commits[s.repo!.branches.main].parents.length, 2);
  // merge --abort puts things back.
  const again = runAll(
    [
      "git switch -c x",
      'echo "1" > narx.txt',
      'git commit -am "1"',
      "git switch main",
      'echo "2" > narx.txt',
      'git commit -am "2"',
    ],
    s,
  );
  const aborted = runAll(["git merge x", "git merge --abort"], again);
  assert.equal(aborted.merging, null);
  assert.equal(aborted.files["narx.txt"], "2\n");
});

test("push to GitHub, a rejected push, then pull and push again", () => {
  const url = "https://github.com/ali/sayt.git";
  let ali = runAll([
    "git init",
    'echo "Salom" > README.md',
    "git add .",
    'git commit -m "boshlash"',
    `git remote add origin ${url}`,
  ]);
  const pushed = exec(ali, "git push -u origin main");
  assert.equal(pushed.error, null);
  assert.ok(pushed.output.some((l) => l.includes("[new branch]")));
  ali = pushed.state;
  // A teammate pushes to the same repository on "GitHub".
  const remote = ali.github[url];
  let vali = emptyState({
    github: { [url]: remote },
    user: { name: "Vali", email: "v@x.uz" },
  });
  vali = runAll(
    [
      `git clone ${url}`,
      'echo "Vali" >> README.md',
      'git commit -am "Vali qo‘shdi"',
      "git push",
    ],
    vali,
  );
  ali = { ...ali, origin: vali.github[url], github: vali.github };
  ali = runAll(['echo "x" > x.txt', "git add .", 'git commit -m "Ali"'], ali);
  const rejected = exec(ali, "git push");
  assert.match(rejected.error!, /failed to push/);
  assert.ok(rejected.output.some((l) => l.includes("fetch first")));
  const pulled = exec(ali, "git pull");
  assert.equal(pulled.error, null);
  ali = pulled.state;
  assert.match(ali.files["README.md"], /Vali/);
  assert.equal(exec(ali, "git push").error, null);
});

test("status shows ahead and behind origin", () => {
  const url = "https://github.com/ali/x.git";
  let s = runAll([
    "git init",
    "touch a",
    "git add .",
    'git commit -m "1"',
    `git remote add origin ${url}`,
    "git push -u origin main",
    'echo "2" > a',
    'git commit -am "2"',
  ]);
  assert.match(
    exec(s, "git status").output.join("\n"),
    /ahead of 'origin\/main' by 1 commit/,
  );
  s = runAll(["git push"], s);
  assert.match(
    exec(s, "git status").output.join("\n"),
    /up to date with 'origin\/main'/,
  );
});

test("unknown commands and bad input never throw", () => {
  const s = emptyState();
  for (const line of [
    "",
    "   ",
    "foo",
    "git",
    "git nope",
    "git init",
    'echo "x',
    "cat",
  ]) {
    const r = run(line, s);
    assert.ok(r.state);
  }
  assert.match(run("foo", s).error!, /command not found/);
});
