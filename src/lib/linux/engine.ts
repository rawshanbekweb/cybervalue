// A bounded, client-only teaching shell. Never executes host commands or requests.
export type FileNode = { kind: "file" | "dir"; content: string; mode: number };
export type Shell = {
  cwd: string;
  previous: string;
  files: Record<string, FileNode>;
  env: Record<string, string>;
  processes: number[];
  history: string[];
};
export type Event = {
  command: string;
  args: string[];
  output: string;
  code: number;
};
export type Result = {
  shell: Shell;
  output: string;
  code: number;
  events: Event[];
  clear: boolean;
};
export const HOME = "/home/student";
const MAX_CONTENT = 32_000;
const MAX_FILES = 250;

export const COMMANDS = {
  pwd: "pwd",
  ls: "ls [-al] [path]",
  cd: "cd [path|-]",
  tree: "tree [path]",
  mkdir: "mkdir [-p] path...",
  touch: "touch file...",
  cat: "cat [file...]",
  echo: "echo [-n] [text...]",
  cp: "cp [-r] source destination",
  mv: "mv source destination",
  rm: "rm [-rf] path...",
  rmdir: "rmdir path...",
  head: "head [-n count] [file]",
  tail: "tail [-n count] [file]",
  grep: "grep [-Finvc] literal [file...]",
  sort: "sort [-rnu] [file]",
  uniq: "uniq [-c] [file]",
  wc: "wc [-lwc] [file]",
  find: "find [path] [-name pattern] [-type f|d]",
  chmod: "chmod 000..777 file...",
  whoami: "whoami",
  id: "id",
  uname: "uname [-a]",
  hostname: "hostname",
  env: "env",
  export: "export NAME=value...",
  ps: "ps",
  kill: "kill PID",
  history: "history",
  clear: "clear",
  help: "help [command]",
  man: "man command",
} as const;
export type Command = keyof typeof COMMANDS;

export function initialShell(): Shell {
  const files: Record<string, FileNode> = Object.create(null);
  for (const path of [
    "/",
    "/home",
    HOME,
    `${HOME}/documents`,
    `${HOME}/logs`,
    "/etc",
    "/tmp",
    "/var",
    "/var/log",
  ])
    files[path] = { kind: "dir", content: "", mode: 0o755 };
  const add = (path: string, content: string, mode = 0o644) => {
    files[path] = { kind: "file", content, mode };
  };
  add(
    `${HOME}/readme.txt`,
    "Welcome to the Linux lab.\nPractice, inspect, understand.\nLinux paths are case-sensitive.\n",
  );
  add(`${HOME}/.secret`, "Hidden files start with a dot.\n");
  add(`${HOME}/documents/notes.txt`, "Linux\nShell\nKernel\nPermissions\n");
  add(`${HOME}/documents/users.txt`, "ali\nsara\nali\nzafar\nsara\n");
  add(
    `${HOME}/logs/auth.log`,
    "INFO user=ali login=success\nERROR user=guest login=failed\nINFO user=sara login=success\nERROR user=guest login=failed\nWARN user=ali password=expiring\n",
  );
  add(`${HOME}/backup.sh`, "#!/bin/sh\necho backup-ready\n");
  add(
    "/etc/os-release",
    'NAME="CyberValue Linux (simulation)"\nID=cybervalue\n',
  );
  add("/etc/hostname", "linux-lab\n");
  return {
    cwd: HOME,
    previous: HOME,
    files,
    env: {
      HOME,
      USER: "student",
      SHELL: "/bin/lab-shell",
      PATH: "/usr/bin:/bin",
    },
    processes: [1, 42, 128],
    history: [],
  };
}

export function resolvePath(cwd: string, value: string): string {
  const expanded =
    value === "~"
      ? HOME
      : value.startsWith("~/")
        ? HOME + value.slice(1)
        : value;
  const parts: string[] = [];
  for (const part of (expanded.startsWith("/")
    ? expanded
    : `${cwd}/${expanded}`
  ).split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return "/" + parts.join("/");
}
const parent = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";
const name = (path: string) => path.slice(path.lastIndexOf("/") + 1);
const own = (object: object, key: string) => Object.hasOwn(object, key);
const node = (s: Shell, path: string) =>
  own(s.files, path) ? s.files[path] : undefined;
const fail = (message: string): never => {
  throw new Error(message);
};
const children = (s: Shell, path: string) =>
  Object.keys(s.files)
    .filter((p) => p !== path && parent(p) === path)
    .sort();
function access(s: Shell, path: string, bit: number) {
  const entry = node(s, path) ?? fail(`${path}: No such file or directory`);
  // All virtual files belong to student. Owner permission bits apply.
  if (!(entry.mode & (bit << 6))) fail(`${path}: Permission denied`);
  return entry;
}
function traverse(s: Shell, path: string) {
  let current = parent(path);
  while (true) {
    const entry = access(s, current, 1);
    if (entry.kind !== "dir") fail(`${current}: Not a directory`);
    if (current === "/") break;
    current = parent(current);
  }
}
function read(s: Shell, path: string) {
  traverse(s, path);
  const entry = access(s, path, 4);
  if (entry.kind !== "file") fail(`${path}: Is a directory`);
  return entry.content;
}
function writableParent(s: Shell, path: string) {
  // System fixtures are read-only; /tmp and the student's home are writable.
  if (!(path.startsWith(HOME + "/") || path.startsWith("/tmp/")))
    fail(`${path}: Read-only lab path`);
  traverse(s, path);
  const directory = access(s, parent(path), 2);
  if (directory.kind !== "dir") fail(`${parent(path)}: Not a directory`);
}
function write(s: Shell, path: string, content: string, append = false) {
  writableParent(s, path);
  const old = node(s, path);
  if (old?.kind === "dir") fail(`${path}: Is a directory`);
  if (old) access(s, path, 2);
  const text = (append ? (old?.content ?? "") : "") + content;
  if (text.length > MAX_CONTENT) fail("Lab file limit: 32,000 characters");
  if (!old && Object.keys(s.files).length >= MAX_FILES)
    fail("Lab limit: 250 files");
  s.files[path] = { kind: "file", content: text, mode: old?.mode ?? 0o644 };
}

type Token = { value: string; operator: boolean };
// Quotes and escaped operators stay literal. Expansion never becomes executable code.
function tokenize(input: string, env: Shell["env"]): Token[] {
  const tokens: Token[] = [];
  let value = "",
    started = false,
    quote = "";
  const flush = () => {
    if (started) tokens.push({ value, operator: false });
    value = "";
    started = false;
  };
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === "\\" && quote !== "'") {
      if (++i >= input.length) fail("Incomplete escape");
      value += input[i];
      started = true;
      continue;
    }
    if ((char === "'" || char === '"') && (!quote || quote === char)) {
      quote = quote ? "" : char;
      started = true;
      continue;
    }
    if (char === "$" && quote !== "'") {
      if (input[i + 1] === "(")
        fail("Command substitution is not supported in this lab");
      const match =
        /^(?:\{([A-Za-z_][A-Za-z_0-9]*)\}|([A-Za-z_][A-Za-z_0-9]*))/.exec(
          input.slice(i + 1),
        );
      if (match) {
        const key = match[1] ?? match[2];
        value += own(env, key) ? env[key] : "";
        i += match[0].length;
        started = true;
        continue;
      }
    }
    if (char === "`" && quote !== "'")
      fail("Command substitution is not supported in this lab");
    if (!quote && /\s/.test(char)) {
      flush();
      continue;
    }
    if (!quote && "|><;&".includes(char)) {
      flush();
      let op = char;
      if (
        (char === ">" || char === "&" || char === "|") &&
        input[i + 1] === char
      )
        op += input[++i];
      if (op === "&" || op === "||") fail(`${op}: Not supported; use ; or &&`);
      tokens.push({ value: op, operator: true });
      continue;
    }
    value += char;
    started = true;
  }
  if (quote) fail("Unclosed quote");
  flush();
  return tokens;
}

function options(args: string[], allowed: string) {
  const flags = new Set<string>(),
    operands: string[] = [];
  let ended = false;
  for (const arg of args) {
    if (!ended && arg === "--") {
      ended = true;
      continue;
    }
    if (!ended && arg.startsWith("-") && arg !== "-") {
      for (const flag of arg.slice(1)) {
        if (!allowed.includes(flag)) fail(`Unsupported option: -${flag}`);
        flags.add(flag);
      }
    } else operands.push(arg);
  }
  return { flags, operands };
}
const lines = (text: string) =>
  text === "" ? [] : text.replace(/\n$/, "").split("\n");
const asLines = (rows: string[]) => (rows.length ? rows.join("\n") + "\n" : "");
function requireCount(args: string[], min: number, max = min) {
  if (args.length < min || args.length > max)
    fail("Wrong number of arguments; use help <command>");
}
function permission(mode: number) {
  return [6, 3, 0]
    .map((shift) =>
      [4, 2, 1]
        .map((bit, i) => (mode & (bit << shift) ? "rwx"[i] : "-"))
        .join(""),
    )
    .join("");
}

function command(
  s: Shell,
  cmd: string,
  args: string[],
  stdin: string,
): { output: string; code: number; clear?: boolean } {
  const ok = (output = "") => ({ output, code: 0 });
  const path = (value: string) => resolvePath(s.cwd, value);
  const input = (files: string[]) =>
    files.length
      ? files.map((f) => (f === "-" ? stdin : read(s, path(f)))).join("")
      : stdin;
  if (!own(COMMANDS, cmd)) fail(`${cmd}: command not found. Type help.`);
  if (args[0] === "--help") return ok(COMMANDS[cmd as Command] + "\n");
  switch (cmd) {
    case "help":
    case "man": {
      requireCount(args, cmd === "man" ? 1 : 0, 1);
      if (args[0] && !own(COMMANDS, args[0])) fail(`${args[0]}: no lab manual`);
      return ok(
        args[0]
          ? COMMANDS[args[0] as Command] + "\n"
          : Object.values(COMMANDS).join("\n") +
              "\n\nOperators: | > >> < && ;\nSubset: literal grep, numeric chmod. No glob expansion, scripts, sudo, packages or network.\n",
      );
    }
    case "pwd":
      requireCount(args, 0);
      return ok(s.cwd + "\n");
    case "whoami":
      requireCount(args, 0);
      return ok("student\n");
    case "id":
      requireCount(args, 0);
      return ok("uid=1000(student) gid=1000(student) groups=1000(student)\n");
    case "hostname":
      requireCount(args, 0);
      return ok("linux-lab\n");
    case "uname": {
      const { flags, operands } = options(args, "a");
      requireCount(operands, 0);
      return ok(
        flags.has("a")
          ? "Linux linux-lab 6.8.0 LAB-SIMULATION x86_64 GNU/Linux\n"
          : "Linux\n",
      );
    }
    case "cd": {
      requireCount(args, 0, 1);
      const destination = args[0] === "-" ? s.previous : path(args[0] ?? HOME);
      traverse(s, destination);
      if (access(s, destination, 1).kind !== "dir")
        fail(`${destination}: Not a directory`);
      s.previous = s.cwd;
      s.cwd = destination;
      return ok(args[0] === "-" ? destination + "\n" : "");
    }
    case "ls": {
      const { flags, operands } = options(args, "al");
      requireCount(operands, 0, 1);
      const target = path(operands[0] ?? ".");
      traverse(s, target);
      const entry = access(s, target, 4);
      const paths =
        entry.kind === "dir"
          ? children(s, target).filter(
              (p) => flags.has("a") || !name(p).startsWith("."),
            )
          : [target];
      const display = paths.map((p) => {
        const n = s.files[p];
        return flags.has("l")
          ? `${n.kind === "dir" ? "d" : "-"}${permission(n.mode)} student student ${new TextEncoder().encode(n.content).length} ${name(p)}`
          : name(p);
      });
      if (entry.kind === "dir" && flags.has("a"))
        display.unshift(
          ...(flags.has("l")
            ? [`.  (current directory)`, `.. (parent directory)`]
            : [".", ".."]),
        );
      return ok(asLines(display));
    }
    case "tree": {
      requireCount(args, 0, 1);
      const target = path(args[0] ?? ".");
      traverse(s, target);
      access(s, target, 4);
      const rows = [target];
      const visit = (p: string, indent: string) => {
        if (s.files[p].kind !== "dir") return;
        access(s, p, 4);
        access(s, p, 1);
        for (const child of children(s, p)) {
          rows.push(indent + "└── " + name(child));
          visit(child, indent + "    ");
        }
      };
      visit(target, "");
      return ok(asLines(rows));
    }
    case "mkdir": {
      const { flags, operands } = options(args, "p");
      requireCount(operands, 1, 20);
      for (const operand of operands) {
        const target = path(operand);
        const make = (p: string) => {
          if (node(s, p)) {
            if (flags.has("p") && s.files[p].kind === "dir") return;
            fail(`${p}: File exists`);
          }
          if (flags.has("p") && !node(s, parent(p))) make(parent(p));
          writableParent(s, p);
          if (Object.keys(s.files).length >= MAX_FILES)
            fail("Lab limit: 250 files");
          s.files[p] = { kind: "dir", content: "", mode: 0o755 };
        };
        make(target);
      }
      return ok();
    }
    case "touch": {
      const { operands } = options(args, "");
      requireCount(operands, 1, 20);
      for (const operand of operands) {
        const p = path(operand);
        if (!node(s, p)) write(s, p, "");
        else {
          traverse(s, p);
          access(s, p, 2);
        }
      }
      return ok();
    }
    case "echo": {
      const noNewline = args[0] === "-n";
      return ok(
        (noNewline ? args.slice(1) : args).join(" ") + (noNewline ? "" : "\n"),
      );
    }
    case "cat": {
      const { operands } = options(args, "");
      return ok(input(operands));
    }
    case "cp":
    case "mv": {
      const { flags, operands } = options(args, cmd === "cp" ? "r" : "");
      requireCount(operands, 2);
      const source = path(operands[0]);
      traverse(s, source);
      const sourceNode = access(s, source, 4);
      let dest = path(operands[1]);
      if (node(s, dest)?.kind === "dir") dest = resolvePath(dest, name(source));
      if (source === dest) fail("Source and destination are the same");
      if (dest.startsWith(source + "/"))
        fail("Cannot copy or move a directory into itself");
      if (sourceNode.kind === "dir" && cmd === "cp" && !flags.has("r"))
        fail("Directory requires cp -r");
      if (sourceNode.kind === "dir" && node(s, dest))
        fail("Merging existing directories is not supported in this lab");
      writableParent(s, dest);
      if (cmd === "mv") {
        writableParent(s, source);
        if (s.cwd === source || s.cwd.startsWith(source + "/"))
          fail("Leave the directory before moving it");
      }
      const descendants = Object.keys(s.files)
        .filter((p) => p === source || p.startsWith(source + "/"))
        .sort((a, b) => a.length - b.length);
      if (Object.keys(s.files).length + descendants.length > MAX_FILES)
        fail("Lab limit: 250 files");
      for (const p of descendants) {
        const target = dest + p.slice(source.length),
          n = s.files[p];
        traverse(s, p);
        access(s, p, 4);
        if (n.kind === "dir") {
          access(s, p, 1);
          writableParent(s, target);
          s.files[target] = { ...n };
        } else {
          write(s, target, read(s, p));
          if (!node(s, target)) fail("Copy failed");
          s.files[target].mode = n.mode;
        }
      }
      if (cmd === "mv") for (const p of descendants) delete s.files[p];
      return ok();
    }
    case "rm":
    case "rmdir": {
      const { flags, operands } = options(args, cmd === "rm" ? "rf" : "");
      requireCount(operands, 1, 20);
      for (const operand of operands) {
        const p = path(operand);
        writableParent(s, p);
        const entry = node(s, p);
        if (!entry) {
          if (flags.has("f")) continue;
          return fail(`${p}: No such file or directory`);
        }
        if (s.cwd === p || s.cwd.startsWith(p + "/"))
          fail("Leave the directory before removing it");
        const descendants = Object.keys(s.files).filter((f) =>
          f.startsWith(p + "/"),
        );
        if (cmd === "rmdir" && entry.kind !== "dir")
          fail(`${p}: Not a directory`);
        if (
          entry.kind === "dir" &&
          (cmd === "rmdir" ? descendants.length > 0 : !flags.has("r"))
        )
          fail(`${p}: Directory needs rm -r, or must be empty for rmdir`);
        for (const f of descendants) writableParent(s, f);
        for (const f of [p, ...descendants]) delete s.files[f];
      }
      return ok();
    }
    case "head":
    case "tail": {
      let count = 10;
      const rest = [...args];
      if (rest[0] === "-n") {
        rest.shift();
        const raw = rest.shift() ?? "";
        if (!/^\d+$/.test(raw)) fail("Use -n with a non-negative integer");
        count = Math.min(Number(raw), MAX_CONTENT);
      }
      const { operands } = options(rest, "");
      requireCount(operands, 0, 1);
      const rows = input(operands).match(/[^\n]*\n|[^\n]+$/g) ?? [];
      return ok(
        (count === 0
          ? []
          : cmd === "head"
            ? rows.slice(0, count)
            : rows.slice(-count)
        ).join(""),
      );
    }
    case "grep": {
      const { flags, operands } = options(args, "Finvc");
      requireCount(operands, 1, 20);
      const pattern = operands[0];
      if (!flags.has("F") && /[.*+?^$[\]{}()|\\]/.test(pattern))
        fail(
          "Lab grep uses literal text. Use -F for literal symbols; regex is not implemented.",
        );
      const sources = operands.length > 1 ? operands.slice(1) : ["-"];
      let matched = 0;
      const output: string[] = [];
      for (const source of sources) {
        const rows = lines(source === "-" ? stdin : read(s, path(source)));
        let count = 0;
        rows.forEach((row, i) => {
          const found = flags.has("i")
            ? row.toLowerCase().includes(pattern.toLowerCase())
            : row.includes(pattern);
          if (flags.has("v") ? !found : found) {
            count++;
            if (!flags.has("c"))
              output.push(
                (sources.length > 1 ? source + ":" : "") +
                  (flags.has("n") ? `${i + 1}:` : "") +
                  row,
              );
          }
        });
        matched += count;
        if (flags.has("c"))
          output.push((sources.length > 1 ? source + ":" : "") + count);
      }
      return { output: asLines(output), code: matched ? 0 : 1 };
    }
    case "sort": {
      const { flags, operands } = options(args, "rnu");
      requireCount(operands, 0, 1);
      let rows = lines(input(operands)).sort(
        flags.has("n")
          ? (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0)
          : (a, b) => (a < b ? -1 : a > b ? 1 : 0),
      );
      if (flags.has("u")) rows = [...new Set(rows)];
      if (flags.has("r")) rows.reverse();
      return ok(asLines(rows));
    }
    case "uniq": {
      const { flags, operands } = options(args, "c");
      requireCount(operands, 0, 1);
      const groups: { value: string; count: number }[] = [];
      for (const row of lines(input(operands))) {
        const last = groups.at(-1);
        if (last?.value === row) last.count++;
        else groups.push({ value: row, count: 1 });
      }
      return ok(
        asLines(
          groups.map((g) =>
            flags.has("c") ? `${g.count} ${g.value}` : g.value,
          ),
        ),
      );
    }
    case "wc": {
      const { flags, operands } = options(args, "lwc");
      requireCount(operands, 0, 1);
      const text = input(operands);
      const counts = {
        l: (text.match(/\n/g) ?? []).length,
        w: text.trim() ? text.trim().split(/\s+/).length : 0,
        c: new TextEncoder().encode(text).length,
      };
      return ok(
        Object.entries(counts)
          .filter(([key]) => flags.size === 0 || flags.has(key))
          .map(([, n]) => n)
          .join(" ") +
          (operands[0] && operands[0] !== "-" ? " " + operands[0] : "") +
          "\n",
      );
    }
    case "find": {
      const rest = [...args];
      const start = rest[0] && !rest[0].startsWith("-") ? rest.shift()! : ".";
      let pattern: string | undefined, kind: string | undefined;
      while (rest.length) {
        const key = rest.shift(),
          value = rest.shift();
        if (!value) fail("Missing find argument");
        if (key === "-name") pattern = value;
        else if (key === "-type" && ["f", "d"].includes(value!)) kind = value;
        else fail("Use find [path] [-name pattern] [-type f|d]");
      }
      const target = path(start);
      traverse(s, target);
      access(s, target, 4);
      const matches: string[] = [];
      const visit = (p: string) => {
        if (
          (!kind || s.files[p].kind === (kind === "f" ? "file" : "dir")) &&
          (pattern === undefined || globMatches(pattern, name(p)))
        )
          matches.push(
            start.startsWith("/") || start.startsWith("~")
              ? p
              : start.replace(/\/$/, "") + p.slice(target.length),
          );
        if (s.files[p].kind === "dir") {
          access(s, p, 4);
          access(s, p, 1);
          for (const child of children(s, p)) visit(child);
        }
      };
      visit(target);
      return ok(asLines(matches));
    }
    case "chmod": {
      requireCount(args, 2, 20);
      if (!/^[0-7]{3}$/.test(args[0]))
        fail("Lab chmod accepts three octal digits, e.g. 640 or 755");
      for (const operand of args.slice(1)) {
        const p = path(operand);
        writableParent(s, p);
        const entry = node(s, p) ?? fail(`${p}: No such file or directory`);
        entry.mode = parseInt(args[0], 8);
      }
      return ok();
    }
    case "env":
      requireCount(args, 0);
      return ok(asLines(Object.entries(s.env).map(([k, v]) => `${k}=${v}`)));
    case "export": {
      requireCount(args, 1, 20);
      for (const arg of args) {
        const match =
          /^([A-Za-z_][A-Za-z_0-9]*)=(.*)$/s.exec(arg) ??
          fail("Use export NAME=value");
        if (
          [
            "__proto__",
            "constructor",
            "prototype",
            "HOME",
            "USER",
            "SHELL",
            "PATH",
          ].includes(match[1])
        )
          fail("Reserved lab variable");
        if (Object.keys(s.env).length >= 50 && !own(s.env, match[1]))
          fail("Lab limit: 50 variables");
        s.env[match[1]] = match[2];
      }
      return ok();
    }
    case "ps":
      requireCount(args, 0);
      return ok(
        "  PID COMMAND (simulated)\n" +
          asLines(
            s.processes.map(
              (pid) =>
                `  ${pid} ${pid === 1 ? "init" : pid === 42 ? "lab-shell" : "backup-worker"}`,
            ),
          ),
      );
    case "kill": {
      requireCount(args, 1);
      if (!/^\d+$/.test(args[0])) fail("Use kill PID");
      const pid = Number(args[0]);
      if (!s.processes.includes(pid)) fail(`${pid}: No such process`);
      if (pid !== 128) fail(`${pid}: Protected lab process`);
      s.processes = s.processes.filter((p) => p !== pid);
      return ok();
    }
    case "history":
      requireCount(args, 0);
      return ok(asLines(s.history.map((h, i) => `${i + 1}  ${h}`)));
    case "clear":
      requireCount(args, 0);
      return { ...ok(), clear: true };
    default:
      return fail("Unsupported command");
  }
}

export function execute(shell: Shell, source: string): Result {
  const s = structuredClone(shell);
  const result: Result = {
    shell: s,
    output: "",
    code: 0,
    events: [],
    clear: false,
  };
  if (!source.trim()) return result;
  if (source.length > 2_000)
    return {
      ...result,
      code: 2,
      output: "Lab command limit: 2,000 characters\n",
    };
  s.history = [...s.history, source].slice(-100);
  try {
    // Split control lists before expansion, so export X=...; echo "$X" works.
    const rawTokens = tokenize(source, {});
    // Tokenize again per list using original segments (quotes must be preserved).
    void rawTokens;
    const lists: { text: string; connector: string }[] = [];
    let quote = "",
      start = 0,
      connector = ";";
    for (let i = 0; i < source.length; i++) {
      const c = source[i];
      if (c === "\\" && quote !== "'") {
        i++;
        continue;
      }
      if ((c === "'" || c === '"') && (!quote || quote === c)) {
        quote = quote ? "" : c;
        continue;
      }
      if (!quote && (c === ";" || (c === "&" && source[i + 1] === "&"))) {
        lists.push({ text: source.slice(start, i), connector });
        connector = c === ";" ? ";" : "&&";
        if (c === "&") i++;
        start = i + 1;
      }
    }
    lists.push({ text: source.slice(start), connector });
    // Validate every pipeline before any mutations.
    const parse = (text: string) => {
      const tokens = tokenize(text, s.env),
        stages: Token[][] = [[]];
      for (const token of tokens) {
        if (token.operator && token.value === "|") stages.push([]);
        else stages.at(-1)!.push(token);
      }
      for (const stage of stages) {
        if (!stage.length) fail("Syntax error: missing command");
        let words = 0;
        for (let i = 0; i < stage.length; i++) {
          if (!stage[i].operator) {
            words++;
            continue;
          }
          if (
            ![">", ">>", "<"].includes(stage[i].value) ||
            !stage[i + 1] ||
            stage[i + 1].operator
          )
            fail("Syntax error: missing redirection path");
          i++;
        }
        if (!words) fail("Syntax error: missing command");
      }
      return stages;
    };
    if (lists.at(-1)?.text.trim() === "" && lists.at(-1)?.connector === ";")
      lists.pop();
    for (const list of lists) parse(list.text);
    for (const list of lists) {
      if (list.connector === "&&" && result.code !== 0) continue;
      const stages = parse(list.text);
      let piped = "";
      for (const stage of stages) {
        const words: string[] = [];
        const redirects: { op: string; target: string }[] = [];
        for (let i = 0; i < stage.length; i++) {
          if (stage[i].operator) {
            const op = stage[i].value;
            redirects.push({
              op,
              target: resolvePath(s.cwd, stage[++i].value),
            });
          } else words.push(stage[i].value);
        }
        const cmd = words.shift()!;
        let output = "",
          code = 0;
        try {
          let outputTarget: { target: string; append: boolean } | undefined;
          for (const redirection of redirects) {
            if (redirection.op === "<") piped = read(s, redirection.target);
            else {
              write(s, redirection.target, "", redirection.op === ">>");
              outputTarget = {
                target: redirection.target,
                append: redirection.op === ">>",
              };
            }
          }
          // Pipeline builtins run in a child shell. Files and processes remain shared.
          const active =
            stages.length > 1
              ? { ...s, env: { ...s.env }, history: [...s.history] }
              : s;
          const run = command(active, cmd, words, piped);
          s.processes = active.processes;
          output = run.output;
          code = run.code;
          result.clear ||= !!run.clear;
          if (outputTarget) {
            write(s, outputTarget.target, output, outputTarget.append);
            piped = "";
          } else piped = output;
        } catch (error) {
          code = 1;
          output = `${cmd}: ${error instanceof Error ? error.message : "Lab error"}\n`;
          result.output += output;
          piped = "";
        }
        result.events.push({ command: cmd, args: words, output, code });
        result.code = code;
      }
      result.output += piped;
    }
  } catch (error) {
    result.code = 2;
    result.output += `${error instanceof Error ? error.message : "Syntax error"}\n`;
  }
  result.output = result.output.slice(0, 40_000);
  return result;
}

// Iterative wildcard matching avoids constructing an unbounded user regex.
function globMatches(pattern: string, value: string): boolean {
  let p = 0,
    v = 0,
    star = -1,
    checkpoint = 0;
  while (v < value.length) {
    if (pattern[p] === "?" || pattern[p] === value[v]) {
      p++;
      v++;
    } else if (pattern[p] === "*") {
      star = p++;
      checkpoint = v;
    } else if (star >= 0) {
      p = star + 1;
      v = ++checkpoint;
    } else return false;
  }
  while (pattern[p] === "*") p++;
  return p === pattern.length;
}

export function complete(shell: Shell, input: string): string[] {
  const match = /(?:^|\s)([^\s]*)$/.exec(input);
  if (!match) return [];
  const prefix = match[1];
  if (!input.trimStart().includes(" "))
    return Object.keys(COMMANDS).filter((c) => c.startsWith(prefix));
  const slash = prefix.lastIndexOf("/"),
    directory = slash >= 0 ? prefix.slice(0, slash + 1) : "";
  const base = prefix.slice(slash + 1),
    target = resolvePath(shell.cwd, directory || ".");
  return children(shell, target)
    .filter((p) => name(p).startsWith(base))
    .map(
      (p) => directory + name(p) + (shell.files[p].kind === "dir" ? "/" : ""),
    );
}

// Reject malformed snapshots as a whole instead of trusting persisted filesystem shape.
export function restoreShell(value: unknown): Shell {
  const fresh = initialShell();
  if (!value || typeof value !== "object" || Array.isArray(value)) return fresh;
  const candidate = value as Shell;
  if (
    !candidate.files ||
    typeof candidate.files !== "object" ||
    Array.isArray(candidate.files)
  )
    return fresh;
  const entries = Object.entries(candidate.files);
  if (entries.length > MAX_FILES || entries.length < 2) return fresh;
  for (const [path, entry] of entries) {
    if (
      !path.startsWith("/") ||
      path.length > 2000 ||
      resolvePath("/", path) !== path ||
      !entry ||
      !["file", "dir"].includes(entry.kind) ||
      typeof entry.content !== "string" ||
      entry.content.length > MAX_CONTENT ||
      !Number.isInteger(entry.mode) ||
      entry.mode < 0 ||
      entry.mode > 0o777
    )
      return fresh;
    if (path !== "/" && candidate.files[parent(path)]?.kind !== "dir")
      return fresh;
  }
  if (
    candidate.files["/"]?.kind !== "dir" ||
    candidate.files[HOME]?.kind !== "dir" ||
    typeof candidate.cwd !== "string" ||
    candidate.files[candidate.cwd]?.kind !== "dir"
  )
    return fresh;
  const env = { ...fresh.env };
  if (
    candidate.env &&
    typeof candidate.env === "object" &&
    !Array.isArray(candidate.env)
  )
    for (const [key, val] of Object.entries(candidate.env).slice(0, 50))
      if (
        /^[A-Za-z_][A-Za-z_0-9]*$/.test(key) &&
        !["__proto__", "constructor", "prototype"].includes(key) &&
        typeof val === "string" &&
        val.length <= 2000 &&
        !own(fresh.env, key)
      )
        env[key] = val;
  return {
    cwd: candidate.cwd,
    previous:
      typeof candidate.previous === "string" &&
      candidate.files[candidate.previous]?.kind === "dir"
        ? candidate.previous
        : HOME,
    files: Object.fromEntries(
      entries.map(([p, n]) => [
        p,
        { kind: n.kind, content: n.content, mode: n.mode },
      ]),
    ),
    env,
    processes: Array.isArray(candidate.processes)
      ? [1, 42, ...(candidate.processes.includes(128) ? [128] : [])]
      : fresh.processes,
    history: Array.isArray(candidate.history)
      ? candidate.history
          .filter((h) => typeof h === "string" && h.length <= 2000)
          .slice(-100)
      : [],
  };
}
