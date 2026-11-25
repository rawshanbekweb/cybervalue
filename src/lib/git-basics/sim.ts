// A small Git that runs in the browser for the Git & GitHub lab: a working
// folder, the staging area (index), commits, branches, merges with
// conflicts, and a pretend GitHub remote for push, pull and clone. It is a
// teaching model, not a full Git: enough commands, with Git's own wording,
// for a beginner to see what each one changes. No network, no real files.

export type Files = Record<string, string>;

export type Commit = {
  id: string;
  parents: string[];
  message: string;
  author: string;
  /** The snapshot: every tracked file and its content. */
  tree: Files;
  /** Branch it was made on, for the graph's lanes. */
  lane: string;
  n: number;
};

export type Repo = {
  commits: Record<string, Commit>;
  branches: Record<string, string>;
  /** The branch checked out (always a branch in this model). */
  head: string;
  index: Files;
};

export type Remote = {
  url: string;
  commits: Record<string, Commit>;
  branches: Record<string, string>;
};

export type State = {
  files: Files;
  repo: Repo | null;
  /** The repository's "origin", when one is added or cloned. */
  origin: Remote | null;
  /** What we last fetched from origin: origin/<branch> → commit. */
  tracking: Record<string, string>;
  /** Remotes that exist "on GitHub" and can be cloned or added. */
  github: Record<string, Remote>;
  user: { name: string; email: string } | null;
  /** A merge stopped by conflicts: the other commit and the files. */
  merging: { theirs: string; branch: string; files: string[] } | null;
  counter: number;
};

export type Result = { state: State; output: string[]; error: string | null };

const clone = <T>(value: T): T => structuredClone(value);

export function emptyState(init: Partial<State> = {}): State {
  return {
    files: {},
    repo: null,
    origin: null,
    tracking: {},
    github: {},
    user: { name: "Ali", email: "ali@example.uz" },
    merging: null,
    counter: 0,
    ...clone(init),
  };
}

/** A short, stable commit id from the content (seven hex digits). */
function commitId(seed: string) {
  let h = 0x811c9dc5;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let h2 = h ^ 0x5bd1e995;
  for (const ch of seed.split("").reverse()) {
    h2 ^= ch.charCodeAt(0);
    h2 = Math.imul(h2, 0x01000193) >>> 0;
  }
  return (h.toString(16) + h2.toString(16)).padStart(14, "0").slice(0, 7);
}

/** Makes a commit object (used by the simulator and by lesson set-ups). */
export function makeCommit(
  state: State,
  tree: Files,
  message: string,
  parents: string[],
  lane: string,
  author = state.user?.name ?? "Ali",
): Commit {
  state.counter += 1;
  const id = commitId(
    `${state.counter}|${message}|${parents.join(",")}|${JSON.stringify(tree)}`,
  );
  return {
    id,
    parents,
    message,
    author,
    tree: clone(tree),
    lane,
    n: state.counter,
  };
}

// --- Parsing -----------------------------------------------------------------

/** Splits a command line into words, keeping quoted text together. */
export function words(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let quote: string | null = null;
  let has = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (has || current) out.push(current);
      current = "";
      has = false;
    } else {
      current += ch;
      has = true;
    }
  }
  if (has || current) out.push(current);
  return out;
}

const ok = (state: State, output: string[] = []): Result => ({
  state,
  output,
  error: null,
});
const fail = (state: State, error: string, output: string[] = []): Result => ({
  state,
  output,
  error,
});

// --- Helpers -------------------------------------------------------------------

const headCommit = (repo: Repo) => repo.branches[repo.head] ?? null;
const treeOf = (repo: Repo, id: string | null): Files =>
  id ? repo.commits[id].tree : {};

/** Commits reachable from `id` (itself included). */
export function ancestors(commits: Record<string, Commit>, id: string | null) {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c) || !commits[c]) continue;
    seen.add(c);
    stack.push(...commits[c].parents);
  }
  return seen;
}

function mergeBase(commits: Record<string, Commit>, a: string, b: string) {
  const fromA = ancestors(commits, a);
  // The newest common ancestor (highest creation number).
  let best: Commit | null = null;
  for (const id of ancestors(commits, b))
    if (fromA.has(id) && (!best || commits[id].n > best.n)) best = commits[id];
  return best?.id ?? null;
}

/** Simple .gitignore: exact names, "*.ext" and "dir/" patterns. */
export function ignored(files: Files, path: string) {
  const rules = (files[".gitignore"] ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return rules.some((rule) => {
    if (rule.endsWith("/")) return path.startsWith(rule);
    if (rule.startsWith("*.")) return path.endsWith(rule.slice(1));
    return path === rule || path.startsWith(`${rule}/`);
  });
}

type FileStatus = {
  staged: { path: string; kind: "new file" | "modified" | "deleted" }[];
  unstaged: { path: string; kind: "modified" | "deleted" }[];
  untracked: string[];
};

export function fileStatus(state: State): FileStatus {
  const repo = state.repo!;
  const head = treeOf(repo, headCommit(repo));
  const staged: FileStatus["staged"] = [];
  const unstaged: FileStatus["unstaged"] = [];
  const untracked: string[] = [];
  const paths = new Set([
    ...Object.keys(head),
    ...Object.keys(repo.index),
    ...Object.keys(state.files),
  ]);
  for (const path of [...paths].sort()) {
    const inHead = path in head;
    const inIndex = path in repo.index;
    const inWork = path in state.files;
    if (inIndex && !inHead) staged.push({ path, kind: "new file" });
    else if (inIndex && inHead && repo.index[path] !== head[path])
      staged.push({ path, kind: "modified" });
    else if (!inIndex && inHead) staged.push({ path, kind: "deleted" });
    if (inIndex && inWork && state.files[path] !== repo.index[path])
      unstaged.push({ path, kind: "modified" });
    else if (inIndex && !inWork) unstaged.push({ path, kind: "deleted" });
    if (!inIndex && inWork && !inHead && !ignored(state.files, path))
      untracked.push(path);
  }
  return { staged, unstaged, untracked };
}

function lineDiff(before: string, after: string): string[] {
  const a = before === "" ? [] : before.replace(/\n$/, "").split("\n");
  const b = after === "" ? [] : after.replace(/\n$/, "").split("\n");
  // Longest common subsequence, fine for lesson-sized files.
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      out.push(` ${a[i]}`);
      i++;
      j++;
    } else if (
      j < b.length &&
      (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])
    ) {
      out.push(`+${b[j]}`);
      j++;
    } else {
      out.push(`-${a[i]}`);
      i++;
    }
  }
  return out;
}

function diffFiles(before: Files, after: Files): string[] {
  const out: string[] = [];
  const paths = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].sort();
  for (const path of paths) {
    if (before[path] === after[path]) continue;
    out.push(`diff --git a/${path} b/${path}`);
    if (!(path in before)) out.push("new file mode 100644");
    if (!(path in after)) out.push("deleted file mode 100644");
    out.push(`--- ${path in before ? `a/${path}` : "/dev/null"}`);
    out.push(`+++ ${path in after ? `b/${path}` : "/dev/null"}`);
    out.push(...lineDiff(before[path] ?? "", after[path] ?? ""));
  }
  return out;
}

/** Writes `content` into the working folder as `git checkout` would. */
function checkoutTree(state: State, from: Files, to: Files) {
  for (const path of Object.keys(from))
    if (!(path in to)) delete state.files[path];
  for (const [path, content] of Object.entries(to)) state.files[path] = content;
}

const NOT_A_REPO =
  "fatal: not a git repository (or any of the parent directories): .git";

// --- Shell commands ------------------------------------------------------------

function shell(argv: string[], line: string, state: State): Result | null {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case "ls": {
      const all =
        rest.includes("-a") || rest.includes("-la") || rest.includes("-al");
      const names = Object.keys(state.files)
        .map((p) => p.split("/")[0])
        .filter((p, i, list) => list.indexOf(p) === i)
        .filter((p) => all || !p.startsWith("."))
        .sort();
      if (all && state.repo) names.unshift(".git");
      return ok(state, names.length ? [names.join("  ")] : []);
    }
    case "cat": {
      if (!rest.length) return fail(state, "cat: fayl nomini yozing");
      const out: string[] = [];
      for (const path of rest) {
        if (!(path in state.files))
          return fail(state, `cat: ${path}: No such file or directory`, out);
        out.push(...state.files[path].replace(/\n$/, "").split("\n"));
      }
      return ok(state, out);
    }
    case "touch": {
      for (const path of rest)
        if (!(path in state.files)) state.files[path] = "";
      return ok(state);
    }
    case "rm": {
      const paths = rest.filter((p) => !p.startsWith("-"));
      for (const path of paths) {
        if (!(path in state.files))
          return fail(
            state,
            `rm: cannot remove '${path}': No such file or directory`,
          );
        delete state.files[path];
      }
      return ok(state);
    }
    case "echo": {
      // echo "text" > file   |   echo "text" >> file   |   echo "text"
      const m = line.match(/^\s*echo\s+(.*?)\s*(>>|>)\s*(\S+)\s*$/);
      if (m) {
        const text = words(m[1]).join(" ");
        const path = m[3];
        state.files[path] =
          m[2] === ">>" ? `${state.files[path] ?? ""}${text}\n` : `${text}\n`;
        return ok(state);
      }
      return ok(state, [words(line.replace(/^\s*echo\s*/, "")).join(" ")]);
    }
    case "pwd":
      return ok(state, ["/home/student/loyiha"]);
    case "help":
      return ok(state, [
        'Fayllar: ls, cat FAYL, touch FAYL, rm FAYL, echo "matn" > FAYL, echo "matn" >> FAYL',
        'Git: git init, git status, git add, git commit -m "...", git log, git diff,',
        "     git branch, git switch, git merge, git remote, git push, git pull, git clone",
      ]);
    default:
      return null;
  }
}

// --- Git commands ----------------------------------------------------------------

function gitConfig(args: string[], state: State): Result {
  const rest = args.filter((a) => a !== "--global");
  const [key, ...value] = rest;
  if (!key) return fail(state, "usage: git config [--global] <key> <value>");
  const user = state.user ?? { name: "", email: "" };
  if (key === "user.name" || key === "user.email") {
    const field = key === "user.name" ? "name" : "email";
    if (!value.length) return ok(state, user[field] ? [user[field]] : []);
    state.user = { ...user, [field]: value.join(" ") };
    return ok(state);
  }
  if (key === "--list" || key === "-l")
    return ok(state, [
      ...(user.name ? [`user.name=${user.name}`] : []),
      ...(user.email ? [`user.email=${user.email}`] : []),
    ]);
  return fail(state, `error: key does not contain a section: ${key}`);
}

function gitInit(state: State): Result {
  if (state.repo)
    return ok(state, [
      "Reinitialized existing Git repository in /home/student/loyiha/.git/",
    ]);
  state.repo = { commits: {}, branches: {}, head: "main", index: {} };
  return ok(state, [
    "Initialized empty Git repository in /home/student/loyiha/.git/",
  ]);
}

function gitStatus(state: State): Result {
  const repo = state.repo!;
  const out = [`On branch ${repo.head}`];
  const tracked = state.tracking[repo.head];
  if (tracked && headCommit(repo)) {
    const local = ancestors(repo.commits, headCommit(repo));
    const remote = ancestors(repo.commits, tracked);
    const ahead = [...local].filter((c) => !remote.has(c)).length;
    const behind = [...remote].filter((c) => !local.has(c)).length;
    if (ahead && behind)
      out.push(
        `Your branch and 'origin/${repo.head}' have diverged,`,
        `and have ${ahead} and ${behind} different commits each, respectively.`,
      );
    else if (ahead)
      out.push(
        `Your branch is ahead of 'origin/${repo.head}' by ${ahead} commit${ahead > 1 ? "s" : ""}.`,
        '  (use "git push" to publish your local commits)',
      );
    else if (behind)
      out.push(
        `Your branch is behind 'origin/${repo.head}' by ${behind} commit${behind > 1 ? "s" : ""}.`,
        '  (use "git pull" to update your local branch)',
      );
    else out.push(`Your branch is up to date with 'origin/${repo.head}'.`);
  }
  if (!headCommit(repo)) out.push("", "No commits yet");
  if (state.merging) {
    out.push(
      "",
      "You have unmerged paths.",
      '  (fix conflicts and run "git commit")',
      "",
      "Unmerged paths:",
      '  (use "git add <file>..." to mark resolution)',
      ...state.merging.files
        .filter((f) => (repo.index[f] ?? "").includes("<<<<<<<"))
        .map((f) => `\tboth modified:   ${f}`),
    );
  }
  const { staged, unstaged, untracked } = fileStatus(state);
  if (staged.length)
    out.push(
      "",
      "Changes to be committed:",
      '  (use "git restore --staged <file>..." to unstage)',
      ...staged.map((s) => `\t${`${s.kind}:`.padEnd(12)}${s.path}`),
    );
  if (unstaged.length)
    out.push(
      "",
      "Changes not staged for commit:",
      '  (use "git add <file>..." to update what will be committed)',
      ...unstaged.map((s) => `\t${`${s.kind}:`.padEnd(12)}${s.path}`),
    );
  if (untracked.length)
    out.push(
      "",
      "Untracked files:",
      '  (use "git add <file>..." to include in what will be committed)',
      ...untracked.map((p) => `\t${p}`),
    );
  if (!staged.length && !unstaged.length && !untracked.length && !state.merging)
    out.push(
      "",
      headCommit(repo)
        ? "nothing to commit, working tree clean"
        : 'nothing to commit (create/copy files and use "git add" to track)',
    );
  return ok(state, out);
}

function gitAdd(args: string[], state: State): Result {
  const repo = state.repo!;
  if (!args.length)
    return fail(state, "Nothing specified, nothing added.", [
      "hint: Maybe you wanted to say 'git add .'?",
    ]);
  const all =
    args.includes(".") || args.includes("-A") || args.includes("--all");
  const head = treeOf(repo, headCommit(repo));
  const targets = all
    ? [...new Set([...Object.keys(state.files), ...Object.keys(repo.index)])]
    : args;
  const skipped: string[] = [];
  for (const path of targets) {
    const inWork = path in state.files;
    if (!inWork && !(path in repo.index) && !(path in head)) {
      if (!all)
        return fail(state, `fatal: pathspec '${path}' did not match any files`);
      continue;
    }
    if (inWork && ignored(state.files, path) && !(path in repo.index)) {
      if (!all) skipped.push(path);
      continue;
    }
    if (inWork) repo.index[path] = state.files[path];
    else delete repo.index[path];
  }
  if (skipped.length)
    return fail(
      state,
      "The following paths are ignored by one of your .gitignore files:",
      [...skipped, "hint: Use -f if you really want to add them."],
    );
  return ok(state);
}

function gitRestore(args: string[], state: State): Result {
  const repo = state.repo!;
  const staged = args.includes("--staged");
  const paths = args.filter((a) => !a.startsWith("-"));
  if (!paths.length)
    return fail(state, "fatal: you must specify path(s) to restore");
  const head = treeOf(repo, headCommit(repo));
  for (const path of paths) {
    if (staged) {
      if (path in head) repo.index[path] = head[path];
      else delete repo.index[path];
    } else {
      if (!(path in repo.index))
        return fail(
          state,
          `error: pathspec '${path}' did not match any file(s) known to git`,
        );
      state.files[path] = repo.index[path];
    }
  }
  return ok(state);
}

function gitRm(args: string[], state: State): Result {
  const repo = state.repo!;
  const cached = args.includes("--cached");
  const paths = args.filter((a) => !a.startsWith("-"));
  if (!paths.length) return fail(state, "usage: git rm [--cached] <file>...");
  for (const path of paths) {
    if (!(path in repo.index))
      return fail(state, `fatal: pathspec '${path}' did not match any files`);
    delete repo.index[path];
    if (!cached) delete state.files[path];
  }
  return ok(
    state,
    paths.map((p) => `rm '${p}'`),
  );
}

function gitCommit(args: string[], state: State): Result {
  const repo = state.repo!;
  const at = args.findIndex((a) => a === "-m" || a === "-am");
  if (args.includes("-am") || args.includes("-a")) {
    // Stage every tracked, changed file first.
    for (const path of Object.keys(repo.index))
      if (path in state.files) repo.index[path] = state.files[path];
      else delete repo.index[path];
  }
  const message = at >= 0 ? args[at + 1] : undefined;
  if (!state.user?.name || !state.user.email)
    return fail(state, "Author identity unknown", [
      "*** Please tell me who you are.",
      "",
      "Run",
      '  git config --global user.email "you@example.com"',
      '  git config --global user.name "Your Name"',
    ]);
  if (message === undefined || !message.trim())
    return fail(state, "Aborting commit due to empty commit message.", [
      'hint: use git commit -m "xabar"',
    ]);
  const parent = headCommit(repo);
  const head = treeOf(repo, parent);
  if (state.merging) {
    const unresolved = state.merging.files.filter((f) =>
      (repo.index[f] ?? "").includes("<<<<<<<"),
    );
    if (unresolved.length)
      return fail(
        state,
        "error: Committing is not possible because you have unmerged files.",
        ["hint: Fix them up in the work tree, and then use 'git add <file>'"],
      );
  }
  if (!state.merging && JSON.stringify(repo.index) === JSON.stringify(head)) {
    const { untracked, unstaged } = fileStatus(state);
    return fail(
      state,
      untracked.length || unstaged.length
        ? 'no changes added to commit (use "git add" and/or "git commit -a")'
        : "nothing to commit, working tree clean",
      [`On branch ${repo.head}`],
    );
  }
  const parents = parent ? [parent] : [];
  if (state.merging) parents.push(state.merging.theirs);
  const commit = makeCommit(state, repo.index, message, parents, repo.head);
  repo.commits[commit.id] = commit;
  repo.branches[repo.head] = commit.id;
  state.merging = null;
  const changed = Object.keys({ ...head, ...repo.index }).filter(
    (p) => head[p] !== repo.index[p],
  ).length;
  return ok(state, [
    `[${repo.head}${parent ? "" : " (root-commit)"} ${commit.id}] ${message}`,
    ` ${changed} file${changed === 1 ? "" : "s"} changed`,
  ]);
}

function gitLog(args: string[], state: State): Result {
  const repo = state.repo!;
  const start = headCommit(repo);
  if (!start)
    return fail(
      state,
      `fatal: your current branch '${repo.head}' does not have any commits yet`,
    );
  const reach = ancestors(repo.commits, start);
  const list = [...reach]
    .map((id) => repo.commits[id])
    .sort((a, b) => b.n - a.n);
  const labels = (id: string) => {
    const names = Object.entries(repo.branches)
      .filter(([, c]) => c === id)
      .map(([b]) => (b === repo.head ? `HEAD -> ${b}` : b));
    const remote = Object.entries(state.tracking)
      .filter(([, c]) => c === id)
      .map(([b]) => `origin/${b}`);
    const all = [...names, ...remote];
    return all.length ? ` (${all.join(", ")})` : "";
  };
  const oneline = args.includes("--oneline");
  const patch = args.includes("-p");
  const out: string[] = [];
  for (const c of list) {
    if (oneline) {
      out.push(`${c.id}${labels(c.id)} ${c.message}`);
      continue;
    }
    out.push(`commit ${c.id}${labels(c.id)}`);
    if (c.parents.length > 1) out.push(`Merge: ${c.parents.join(" ")}`);
    out.push(`Author: ${c.author}`, "", `    ${c.message}`, "");
    if (patch)
      out.push(
        ...diffFiles(
          c.parents[0] ? repo.commits[c.parents[0]].tree : {},
          c.tree,
        ),
        "",
      );
  }
  return ok(state, out);
}

function gitShow(args: string[], state: State): Result {
  const repo = state.repo!;
  const ref = args[0] ?? "HEAD";
  const id =
    ref === "HEAD"
      ? headCommit(repo)
      : (repo.branches[ref] ?? resolveId(repo, ref));
  if (!id) return fail(state, `fatal: bad revision '${ref}'`);
  const c = repo.commits[id];
  return ok(state, [
    `commit ${c.id}`,
    `Author: ${c.author}`,
    "",
    `    ${c.message}`,
    "",
    ...diffFiles(c.parents[0] ? repo.commits[c.parents[0]].tree : {}, c.tree),
  ]);
}

function resolveId(repo: Repo, ref: string) {
  const hits = Object.keys(repo.commits).filter((id) => id.startsWith(ref));
  return ref.length >= 4 && hits.length === 1 ? hits[0] : null;
}

function gitDiff(args: string[], state: State): Result {
  const repo = state.repo!;
  if (args.includes("--staged") || args.includes("--cached"))
    return ok(state, diffFiles(treeOf(repo, headCommit(repo)), repo.index));
  // Working folder against the index, for files Git tracks.
  const work: Files = {};
  for (const path of Object.keys(repo.index))
    if (path in state.files) work[path] = state.files[path];
  return ok(state, diffFiles(repo.index, work));
}

function gitBranch(args: string[], state: State): Result {
  const repo = state.repo!;
  const del = args.indexOf("-d") >= 0 ? args.indexOf("-d") : args.indexOf("-D");
  if (del >= 0) {
    const name = args[del + 1];
    if (!name || !(name in repo.branches))
      return fail(state, `error: branch '${name ?? ""}' not found`);
    if (name === repo.head)
      return fail(
        state,
        `error: cannot delete branch '${name}' used by worktree`,
      );
    const merged = ancestors(repo.commits, headCommit(repo)).has(
      repo.branches[name],
    );
    if (!merged && args[del] === "-d")
      return fail(state, `error: the branch '${name}' is not fully merged.`, [
        `If you are sure you want to delete it, run 'git branch -D ${name}'.`,
      ]);
    const id = repo.branches[name];
    delete repo.branches[name];
    return ok(state, [`Deleted branch ${name} (was ${id}).`]);
  }
  const name = args.find((a) => !a.startsWith("-"));
  if (name) {
    const base = headCommit(repo);
    if (!base)
      return fail(state, `fatal: not a valid object name: '${repo.head}'`);
    if (name in repo.branches)
      return fail(state, `fatal: a branch named '${name}' already exists`);
    if (!/^[A-Za-z0-9._/-]+$/.test(name))
      return fail(state, `fatal: '${name}' is not a valid branch name`);
    repo.branches[name] = base;
    return ok(state);
  }
  const names = Object.keys(repo.branches).sort();
  const out = names.map((b) => (b === repo.head ? `* ${b}` : `  ${b}`));
  if (args.includes("-a") || args.includes("-r"))
    out.push(
      ...Object.keys(state.tracking).map((b) => `  remotes/origin/${b}`),
    );
  return ok(state, out);
}

function switchTo(state: State, name: string, create: boolean): Result {
  const repo = state.repo!;
  if (create) {
    if (name in repo.branches)
      return fail(state, `fatal: a branch named '${name}' already exists`);
    if (!headCommit(repo)) {
      repo.head = name;
      return ok(state, [`Switched to a new branch '${name}'`]);
    }
    repo.branches[name] = headCommit(repo)!;
    repo.head = name;
    return ok(state, [`Switched to a new branch '${name}'`]);
  }
  if (!(name in repo.branches)) {
    // Like Git: a branch that exists only on origin is created and tracked.
    if (name in state.tracking) {
      repo.branches[name] = state.tracking[name];
    } else return fail(state, `fatal: invalid reference: ${name}`);
  }
  if (name === repo.head) return ok(state, [`Already on '${name}'`]);
  const { staged, unstaged } = fileStatus(state);
  if (staged.length || unstaged.length)
    return fail(
      state,
      "error: Your local changes to the following files would be overwritten by checkout:",
      [...staged, ...unstaged]
        .map((s) => `\t${s.path}`)
        .concat([
          "Please commit your changes or stash them before you switch branches.",
          "Aborting",
        ]),
    );
  const from = treeOf(repo, headCommit(repo));
  repo.head = name;
  const to = treeOf(repo, headCommit(repo));
  checkoutTree(state, from, to);
  repo.index = clone(to);
  return ok(state, [`Switched to branch '${name}'`]);
}

function threeWay(
  base: Files,
  ours: Files,
  theirs: Files,
  branch: string,
  head: string,
) {
  const merged: Files = {};
  const conflicts: string[] = [];
  const paths = new Set([
    ...Object.keys(base),
    ...Object.keys(ours),
    ...Object.keys(theirs),
  ]);
  for (const path of [...paths].sort()) {
    const b = base[path];
    const o = ours[path];
    const t = theirs[path];
    if (o === t) {
      if (o !== undefined) merged[path] = o;
    } else if (o === b) {
      if (t !== undefined) merged[path] = t;
    } else if (t === b) {
      if (o !== undefined) merged[path] = o;
    } else {
      conflicts.push(path);
      merged[path] =
        `<<<<<<< ${head}\n${o ?? ""}${o && !o.endsWith("\n") ? "\n" : ""}=======\n${t ?? ""}${t && !t.endsWith("\n") ? "\n" : ""}>>>>>>> ${branch}\n`;
    }
  }
  return { merged, conflicts };
}

/** Merges commit `theirs` into the current branch. */
function mergeCommit(state: State, theirs: string, label: string): Result {
  const repo = state.repo!;
  const ours = headCommit(repo);
  if (!ours) {
    repo.branches[repo.head] = theirs;
    const to = repo.commits[theirs].tree;
    checkoutTree(state, {}, to);
    repo.index = clone(to);
    return ok(state);
  }
  const fromOurs = ancestors(repo.commits, ours);
  if (fromOurs.has(theirs)) return ok(state, ["Already up to date."]);
  if (ancestors(repo.commits, theirs).has(ours)) {
    const from = treeOf(repo, ours);
    repo.branches[repo.head] = theirs;
    const to = treeOf(repo, theirs);
    checkoutTree(state, from, to);
    repo.index = clone(to);
    const changed = Object.keys({ ...from, ...to }).filter(
      (p) => from[p] !== to[p],
    );
    return ok(state, [
      `Updating ${ours}..${theirs}`,
      "Fast-forward",
      ...changed.map((p) => ` ${p} | changed`),
    ]);
  }
  const base = mergeBase(repo.commits, ours, theirs);
  const { merged, conflicts } = threeWay(
    treeOf(repo, base),
    treeOf(repo, ours),
    treeOf(repo, theirs),
    label,
    "HEAD",
  );
  const before = treeOf(repo, ours);
  checkoutTree(state, before, merged);
  if (conflicts.length) {
    // Clean paths are staged; conflicted ones wait for the student.
    repo.index = clone(merged);
    for (const path of conflicts) repo.index[path] = merged[path];
    state.merging = { theirs, branch: label, files: conflicts };
    return fail(
      state,
      "Automatic merge failed; fix conflicts and then commit the result.",
      conflicts.map((p) => `CONFLICT (content): Merge conflict in ${p}`),
    );
  }
  repo.index = clone(merged);
  const commit = makeCommit(
    state,
    merged,
    `Merge branch '${label}'`,
    [ours, theirs],
    repo.head,
  );
  repo.commits[commit.id] = commit;
  repo.branches[repo.head] = commit.id;
  return ok(state, ["Merge made by the 'ort' strategy."]);
}

function gitMerge(args: string[], state: State): Result {
  const repo = state.repo!;
  if (args.includes("--abort")) {
    if (!state.merging)
      return fail(
        state,
        "fatal: There is no merge to abort (MERGE_HEAD missing).",
      );
    const tree = treeOf(repo, headCommit(repo));
    checkoutTree(state, { ...state.files }, tree);
    repo.index = clone(tree);
    state.merging = null;
    return ok(state);
  }
  if (state.merging)
    return fail(
      state,
      "error: Merging is not possible because you have unmerged files.",
    );
  const name = args.find((a) => !a.startsWith("-"));
  if (!name) return fail(state, "fatal: No remote for the current branch.");
  const remote = name.startsWith("origin/")
    ? state.tracking[name.slice(7)]
    : undefined;
  const theirs = remote ?? repo.branches[name] ?? resolveId(repo, name);
  if (!theirs)
    return fail(state, `merge: ${name} - not something we can merge`);
  if (name === repo.head) return ok(state, ["Already up to date."]);
  return mergeCommit(state, theirs, name);
}

function gitRemote(args: string[], state: State): Result {
  const [sub, name, url] = args;
  if (!sub || sub === "-v") {
    if (!state.origin) return ok(state);
    return ok(
      state,
      sub === "-v"
        ? [
            `origin\t${state.origin.url} (fetch)`,
            `origin\t${state.origin.url} (push)`,
          ]
        : ["origin"],
    );
  }
  if (sub === "add") {
    if (!name || !url) return fail(state, "usage: git remote add <name> <url>");
    if (name !== "origin")
      return fail(
        state,
        "Bu laboratoriyada masofaviy repozitoriy nomi “origin” bo‘lsin.",
      );
    if (state.origin)
      return fail(state, "error: remote origin already exists.");
    const existing = state.github[url];
    state.origin = existing ?? { url, commits: {}, branches: {} };
    if (!existing) state.github[url] = state.origin;
    return ok(state);
  }
  if (sub === "remove" || sub === "rm") {
    state.origin = null;
    state.tracking = {};
    return ok(state);
  }
  return fail(state, `error: unknown subcommand: ${sub}`);
}

function needOrigin(state: State) {
  return state.origin
    ? null
    : fail(state, "fatal: 'origin' does not appear to be a git repository", [
        "fatal: Could not read from remote repository.",
        "",
        "Please make sure you have the correct access rights",
        "and the repository exists.",
      ]);
}

function fetchAll(state: State) {
  const repo = state.repo!;
  const origin = state.origin!;
  let count = 0;
  for (const [id, c] of Object.entries(origin.commits))
    if (!repo.commits[id]) {
      repo.commits[id] = clone(c);
      count++;
    }
  const updated: string[] = [];
  for (const [b, id] of Object.entries(origin.branches))
    if (state.tracking[b] !== id) {
      updated.push(b);
      state.tracking[b] = id;
    }
  return { count, updated };
}

function gitFetch(state: State): Result {
  const missing = needOrigin(state);
  if (missing) return missing;
  const { updated } = fetchAll(state);
  return ok(
    state,
    updated.length
      ? [
          `From ${state.origin!.url}`,
          ...updated.map((b) => `   ${b.padEnd(10)} -> origin/${b}`),
        ]
      : [],
  );
}

function gitPush(args: string[], state: State): Result {
  const repo = state.repo!;
  const missing = needOrigin(state);
  if (missing) return missing;
  const rest = args.filter((a) => !a.startsWith("-"));
  const branch = rest[1] ?? repo.head;
  if (rest[0] && rest[0] !== "origin")
    return fail(
      state,
      `fatal: '${rest[0]}' does not appear to be a git repository`,
    );
  const local = repo.branches[branch];
  if (!local)
    return fail(state, `error: src refspec ${branch} does not match any`);
  const origin = state.origin!;
  const remoteHead = origin.branches[branch];
  if (remoteHead && !ancestors(repo.commits, local).has(remoteHead))
    return fail(state, "error: failed to push some refs", [
      `To ${origin.url}`,
      ` ! [rejected]        ${branch} -> ${branch} (fetch first)`,
      "hint: Updates were rejected because the remote contains work that you do",
      "hint: not have locally. Integrate the remote changes (e.g.",
      "hint: 'git pull ...') before pushing again.",
    ]);
  if (remoteHead === local) return ok(state, ["Everything up-to-date"]);
  let sent = 0;
  for (const id of ancestors(repo.commits, local))
    if (!origin.commits[id]) {
      origin.commits[id] = clone(repo.commits[id]);
      sent++;
    }
  origin.branches[branch] = local;
  state.tracking[branch] = local;
  const out = [
    `Enumerating objects: ${sent * 3}, done.`,
    `Writing objects: 100% (${sent * 3}/${sent * 3}), done.`,
    `To ${origin.url}`,
    remoteHead
      ? `   ${remoteHead}..${local}  ${branch} -> ${branch}`
      : ` * [new branch]      ${branch} -> ${branch}`,
  ];
  if (args.includes("-u") || args.includes("--set-upstream"))
    out.push(`branch '${branch}' set up to track 'origin/${branch}'.`);
  return ok(state, out);
}

function gitPull(state: State): Result {
  const repo = state.repo!;
  const missing = needOrigin(state);
  if (missing) return missing;
  fetchAll(state);
  const theirs = state.tracking[repo.head];
  if (!theirs)
    return fail(
      state,
      "There is no tracking information for the current branch.",
    );
  const result = mergeCommit(state, theirs, `origin/${repo.head}`);
  return {
    ...result,
    output: [`From ${state.origin!.url}`, ...result.output],
  };
}

function gitClone(args: string[], state: State): Result {
  const url = args.find((a) => !a.startsWith("-"));
  if (!url) return fail(state, "usage: git clone <repo>");
  const source = state.github[url];
  if (!source) return fail(state, `fatal: repository '${url}' not found`);
  const name = url
    .replace(/\.git$/, "")
    .split("/")
    .pop()!;
  const main = source.branches.main ? "main" : Object.keys(source.branches)[0];
  const commits = clone(source.commits);
  state.repo = {
    commits,
    branches: { [main]: source.branches[main] },
    head: main,
    index: {},
  };
  state.origin = source;
  state.tracking = { ...source.branches };
  const tree = commits[source.branches[main]].tree;
  state.files = clone(tree);
  state.repo.index = clone(tree);
  return ok(state, [
    `Cloning into '${name}'...`,
    `remote: Enumerating objects: ${Object.keys(commits).length * 3}, done.`,
    `Receiving objects: 100% (${Object.keys(commits).length * 3}/${Object.keys(commits).length * 3}), done.`,
  ]);
}

/** Runs one command line against the state. Never throws. */
export function run(line: string, previous: State): Result {
  const state = clone(previous);
  const argv = words(line.trim());
  if (!argv.length) return ok(state);
  if (argv[0] !== "git") {
    const result = shell(argv, line, state);
    return result ?? fail(state, `${argv[0]}: command not found`);
  }
  const [, sub, ...args] = argv;
  if (!sub || sub === "--help" || sub === "help")
    return ok(state, [
      "usage: git <command> [<args>]",
      "   init, status, add, commit, log, diff, show, restore, rm",
      "   branch, switch, checkout, merge, remote, push, pull, fetch, clone, config",
    ]);
  if (sub === "--version" || sub === "version")
    return ok(state, ["git version 2.43.0"]);
  if (sub === "config") return gitConfig(args, state);
  if (sub === "init") return gitInit(state);
  if (sub === "clone") return gitClone(args, state);
  if (!state.repo) return fail(state, NOT_A_REPO);
  switch (sub) {
    case "status":
      return gitStatus(state);
    case "add":
      return gitAdd(args, state);
    case "restore":
      return gitRestore(args, state);
    case "rm":
      return gitRm(args, state);
    case "commit":
      return gitCommit(args, state);
    case "log":
      return gitLog(args, state);
    case "show":
      return gitShow(args, state);
    case "diff":
      return gitDiff(args, state);
    case "branch":
      return gitBranch(args, state);
    case "switch": {
      const create = args.includes("-c") || args.includes("-C");
      const name = args.find((a) => !a.startsWith("-"));
      if (!name) return fail(state, "fatal: missing branch or commit argument");
      return switchTo(state, name, create);
    }
    case "checkout": {
      const create = args.includes("-b");
      const name = args.find((a) => !a.startsWith("-"));
      if (!name) return fail(state, "fatal: missing branch or commit argument");
      return switchTo(state, name, create);
    }
    case "merge":
      return gitMerge(args, state);
    case "remote":
      return gitRemote(args, state);
    case "fetch":
      return gitFetch(state);
    case "push":
      return gitPush(args, state);
    case "pull":
      return gitPull(state);
    default:
      return fail(
        state,
        `git: '${sub}' is not a git command. See 'git --help'.`,
      );
  }
}

/** Runs several command lines in turn (for lesson set-ups and tests). */
export function runAll(lines: string[], state = emptyState()): State {
  let current = state;
  for (const line of lines) {
    const result = run(line, current);
    if (result.error && !result.error.startsWith("Automatic merge failed"))
      throw new Error(`${line}: ${result.error}`);
    current = result.state;
  }
  return current;
}
