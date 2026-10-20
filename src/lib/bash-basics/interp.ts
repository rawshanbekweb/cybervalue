// A small, safe Bash for the Bash basics lab. It runs entirely in the
// browser on a pretend file system: variables, quotes, $(( )) arithmetic,
// for/while loops, if/elif/else, [ ] tests, script arguments and a handful
// of commands (echo, ls, cat, grep, wc, touch, true, false, exit). Nothing
// here touches a real machine; a step limit stops endless loops.

export type Files = Record<string, string>;

export type State = {
  vars: Record<string, string>;
  files: Files;
  /** $1, $2… while a script runs. */
  args: string[];
  status: number;
};

export type Result = {
  output: string[];
  error: string | null;
  state: State;
  /** Variable assignments in order, for the animated variable shelf. */
  assigned: string[];
};

type Token =
  { kind: "word"; raw: string } | { kind: "sep" } | { kind: "and" | "or" };

type Node =
  | { kind: "cmd"; words: string[] }
  | { kind: "andor"; parts: string[][]; ops: ("and" | "or")[] }
  | { kind: "for"; name: string; items: string[] | null; body: Node[] }
  | { kind: "while"; cond: Node[]; body: Node[]; until: boolean }
  | {
      kind: "if";
      branches: { cond: Node[]; body: Node[] }[];
      otherwise: Node[] | null;
    };

const KEYWORDS = new Set([
  "for",
  "in",
  "do",
  "done",
  "while",
  "until",
  "if",
  "then",
  "elif",
  "else",
  "fi",
]);

export class BashError extends Error {}

function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let word = "";
  let started = false;
  const flush = () => {
    if (started) tokens.push({ kind: "word", raw: word });
    word = "";
    started = false;
  };
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\" && source[i + 1] === "\n") {
      i += 2;
      continue;
    }
    if (source.startsWith("&&", i) || source.startsWith("||", i)) {
      flush();
      tokens.push({ kind: source[i] === "&" ? "and" : "or" });
      i += 2;
      continue;
    }
    if (ch === "\n" || ch === ";") {
      flush();
      tokens.push({ kind: "sep" });
      i++;
      continue;
    }
    if (ch === " " || ch === "\t" || ch === "\r") {
      flush();
      i++;
      continue;
    }
    if (ch === "#" && !started) {
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (ch === "'") {
      const end = source.indexOf("'", i + 1);
      if (end < 0) throw new BashError("unexpected end: missing '");
      word += source.slice(i, end + 1);
      started = true;
      i = end + 1;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < source.length && source[j] !== '"') {
        if (source[j] === "\\") j++;
        j++;
      }
      if (j >= source.length) throw new BashError('unexpected end: missing "');
      word += source.slice(i, j + 1);
      started = true;
      i = j + 1;
      continue;
    }
    if (source.startsWith("$((", i)) {
      const end = source.indexOf("))", i + 3);
      if (end < 0) throw new BashError("unexpected end: missing ))");
      word += source.slice(i, end + 2);
      started = true;
      i = end + 2;
      continue;
    }
    if ((ch === ">" || ch === "<") && !started) {
      const op = source.startsWith(">>", i) ? ">>" : ch;
      tokens.push({ kind: "word", raw: op });
      i += op.length;
      continue;
    }
    word += ch;
    started = true;
    i++;
  }
  flush();
  return tokens;
}

class Parser {
  private at = 0;
  constructor(private tokens: Token[]) {}

  private peek() {
    return this.tokens[this.at];
  }
  private keyword() {
    const token = this.peek();
    return token?.kind === "word" && KEYWORDS.has(token.raw) ? token.raw : null;
  }
  private skipSeps() {
    while (this.peek()?.kind === "sep") this.at++;
  }
  private expect(word: string) {
    this.skipSeps();
    if (this.keyword() !== word)
      throw new BashError(`syntax error: expected “${word}”`);
    this.at++;
  }
  private words() {
    const out: string[] = [];
    while (this.peek()?.kind === "word") {
      out.push((this.peek() as { raw: string }).raw);
      this.at++;
    }
    return out;
  }

  list(stop: string[]): Node[] {
    const nodes: Node[] = [];
    for (;;) {
      this.skipSeps();
      const token = this.peek();
      if (!token) {
        if (stop.length)
          throw new BashError(`syntax error: missing “${stop[0]}”`);
        return nodes;
      }
      const kw = this.keyword();
      if (kw && stop.includes(kw)) return nodes;
      if (kw === "for") {
        this.at++;
        const token = this.peek();
        const name = token?.kind === "word" ? token.raw : "";
        if (!/^[A-Za-z_]\w*$/.test(name))
          throw new BashError("syntax error: for needs a variable name");
        this.at++;
        let items: string[] | null = null;
        if (this.keyword() === "in") {
          this.at++;
          items = this.words();
        }
        this.expect("do");
        const body = this.list(["done"]);
        this.expect("done");
        nodes.push({ kind: "for", name, items, body });
        continue;
      }
      if (kw === "while" || kw === "until") {
        this.at++;
        const cond = this.list(["do"]);
        this.expect("do");
        const body = this.list(["done"]);
        this.expect("done");
        nodes.push({ kind: "while", cond, body, until: kw === "until" });
        continue;
      }
      if (kw === "if") {
        this.at++;
        const branches: { cond: Node[]; body: Node[] }[] = [];
        let otherwise: Node[] | null = null;
        let cond = this.list(["then"]);
        this.expect("then");
        for (;;) {
          const body = this.list(["elif", "else", "fi"]);
          branches.push({ cond, body });
          const next = this.keyword();
          this.at++;
          if (next === "elif") {
            cond = this.list(["then"]);
            this.expect("then");
            continue;
          }
          if (next === "else") {
            otherwise = this.list(["fi"]);
            this.expect("fi");
          }
          break;
        }
        nodes.push({ kind: "if", branches, otherwise });
        continue;
      }
      if (kw && kw !== "in")
        throw new BashError(`syntax error near unexpected “${kw}”`);
      const parts = [this.words()];
      const ops: ("and" | "or")[] = [];
      for (;;) {
        const next = this.peek();
        if (next?.kind !== "and" && next?.kind !== "or") break;
        this.at++;
        ops.push(next.kind);
        const words = this.words();
        if (!words.length)
          throw new BashError("syntax error: command expected after && or ||");
        parts.push(words);
      }
      if (!parts[0].length)
        throw new BashError("syntax error near unexpected && or ||");
      nodes.push(
        ops.length
          ? { kind: "andor", parts, ops }
          : { kind: "cmd", words: parts[0] },
      );
    }
  }
}

export function parse(source: string): Node[] {
  return new Parser(lex(source)).list([]);
}

// --- arithmetic ----------------------------------------------------------

function arith(expr: string, read: (name: string) => string): number {
  const src = expr
    .replace(/\$(\d|#)/g, (_, name: string) => read(name) || "0")
    .replace(/\$\{?([A-Za-z_]\w*)\}?/g, "$1");
  let i = 0;
  const skip = () => {
    while (src[i] === " ") i++;
  };
  const num = (): number => {
    skip();
    if (src[i] === "(") {
      i++;
      const v = cmp();
      skip();
      if (src[i] !== ")") throw new BashError("arithmetic: missing )");
      i++;
      return v;
    }
    if (src[i] === "-") {
      i++;
      return -num();
    }
    const m = /^(\d+|[A-Za-z_]\w*)/.exec(src.slice(i));
    if (!m) throw new BashError(`arithmetic: syntax error in “${expr.trim()}”`);
    i += m[0].length;
    if (/^\d/.test(m[0])) return Number(m[0]);
    const value = read(m[0]);
    return /^-?\d+$/.test(value.trim()) ? Number(value) : 0;
  };
  const term = (): number => {
    let v = num();
    for (;;) {
      skip();
      const op = src[i];
      if (op !== "*" && op !== "/" && op !== "%") return v;
      i++;
      const r = num();
      if (op !== "*" && r === 0) throw new BashError("division by 0");
      v = op === "*" ? v * r : op === "/" ? Math.trunc(v / r) : v % r;
    }
  };
  const sum = (): number => {
    let v = term();
    for (;;) {
      skip();
      const op = src[i];
      if (op !== "+" && op !== "-") return v;
      i++;
      v = op === "+" ? v + term() : v - term();
    }
  };
  const cmp = (): number => {
    const v = sum();
    skip();
    const m = /^(<=|>=|==|!=|<|>)/.exec(src.slice(i));
    if (!m) return v;
    i += m[0].length;
    const r = sum();
    const ok =
      m[0] === "<"
        ? v < r
        : m[0] === ">"
          ? v > r
          : m[0] === "<="
            ? v <= r
            : m[0] === ">="
              ? v >= r
              : m[0] === "=="
                ? v === r
                : v !== r;
    return ok ? 1 : 0;
  };
  const value = cmp();
  skip();
  if (i < src.length)
    throw new BashError(`arithmetic: syntax error in “${expr.trim()}”`);
  return value;
}

// --- the machine ---------------------------------------------------------

const MAX_STEPS = 2000;
const MAX_OUTPUT = 400;

class Exit {
  constructor(public code: number) {}
}

export function run(source: string, start: State): Result {
  const state: State = {
    vars: { ...start.vars },
    files: { ...start.files },
    args: [...start.args],
    status: start.status,
  };
  const output: string[] = [];
  const assigned: string[] = [];
  let steps = 0;

  const read = (name: string): string => {
    if (/^\d$/.test(name))
      return name === "0" ? "script.sh" : (state.args[Number(name) - 1] ?? "");
    if (name === "#") return String(state.args.length);
    if (name === "@" || name === "*") return state.args.join(" ");
    if (name === "?") return String(state.status);
    return state.vars[name] ?? "";
  };

  // Expands $NAME, ${NAME}, $1, $#, $@, $? and $(( )) inside a string.
  const dollars = (text: string) =>
    text.replace(
      /\$\(\((.*?)\)\)|\$\{([A-Za-z_]\w*|\d|[#@?*])\}|\$([A-Za-z_]\w*|\d|[#@?*])/g,
      (_, expr: string, braced: string, bare: string) =>
        expr !== undefined ? String(arith(expr, read)) : read(braced ?? bare),
    );

  const braces = (raw: string): string[] => {
    const range = /^(.*)\{(-?\d+)\.\.(-?\d+)\}(.*)$/.exec(raw);
    if (range && !/['"]/.test(raw)) {
      const [, pre, a, b, post] = range;
      const from = Number(a);
      const to = Number(b);
      if (Math.abs(to - from) > 1000) throw new BashError("range too large");
      const step = from <= to ? 1 : -1;
      const out: string[] = [];
      for (let n = from; step > 0 ? n <= to : n >= to; n += step)
        out.push(`${pre}${n}${post}`);
      return out;
    }
    const list = /^(.*)\{([^{}]*,[^{}]*)\}(.*)$/.exec(raw);
    if (list && !/['"]/.test(raw))
      return list[2].split(",").map((part) => `${list[1]}${part}${list[3]}`);
    return [raw];
  };

  // One raw word becomes zero or more arguments.
  const expand = (raw: string, split = true): string[] => {
    const results: string[] = [];
    for (const word of braces(raw)) {
      let text = "";
      let quoted = false;
      let unquotedVar = false;
      const re = /'([^']*)'|"((?:[^"\\]|\\.)*)"|([^'"]+)/g;
      for (const m of word.matchAll(re)) {
        if (m[1] !== undefined) {
          text += m[1];
          quoted = true;
        } else if (m[2] !== undefined) {
          text += dollars(m[2].replace(/\\(["\\$])/g, "$1"));
          quoted = true;
        } else {
          if (m[3].includes("$")) unquotedVar = true;
          text += dollars(m[3]);
        }
      }
      if (!quoted && /[*?]/.test(text)) {
        const pattern = new RegExp(
          `^${text
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\?/g, ".")}$`,
        );
        const matches = Object.keys(state.files)
          .filter((f) => pattern.test(f))
          .sort();
        results.push(...(matches.length ? matches : [text]));
      } else if (!quoted && unquotedVar && split) {
        results.push(...text.split(/\s+/).filter(Boolean));
      } else {
        results.push(text);
      }
    }
    return results;
  };

  const say = (line: string) => {
    if (output.length >= MAX_OUTPUT)
      throw new BashError("stopped: too much output — is the loop endless?");
    output.push(line);
  };

  const test = (args: string[]): boolean => {
    if (args[0] === "!") return !test(args.slice(1));
    if (args.length === 0) return false;
    if (args.length === 1) return args[0] !== "";
    if (args.length === 2) {
      const [op, value] = args;
      if (op === "-z") return value === "";
      if (op === "-n") return value !== "";
      if (op === "-f" || op === "-e") return value in state.files;
      throw new BashError(`[: unknown test “${op}”`);
    }
    const [a, op, b] = args;
    const int = (v: string) => {
      if (!/^-?\d+$/.test(v.trim()))
        throw new BashError(`[: ${v || "''"}: integer expression expected`);
      return Number(v);
    };
    switch (op) {
      case "=":
      case "==":
        return a === b;
      case "!=":
        return a !== b;
      case "-eq":
        return int(a) === int(b);
      case "-ne":
        return int(a) !== int(b);
      case "-lt":
        return int(a) < int(b);
      case "-le":
        return int(a) <= int(b);
      case "-gt":
        return int(a) > int(b);
      case "-ge":
        return int(a) >= int(b);
    }
    throw new BashError(`[: unknown operator “${op}”`);
  };

  const fileText = (name: string) => {
    if (!(name in state.files))
      throw new BashError(`${name}: No such file or directory`);
    return state.files[name];
  };
  const lines = (text: string) =>
    text === "" ? [] : text.replace(/\n$/, "").split("\n");

  const command = (rawWords: string[]): number => {
    if (++steps > MAX_STEPS)
      throw new BashError("stopped: too many steps — is the loop endless?");
    // Assignments: NAME=value, before any command word.
    let i = 0;
    while (i < rawWords.length && /^[A-Za-z_]\w*=/.test(rawWords[i])) {
      const eq = rawWords[i].indexOf("=");
      const name = rawWords[i].slice(0, eq);
      state.vars[name] = expand(rawWords[i].slice(eq + 1), false).join(" ");
      assigned.push(name);
      i++;
    }
    if (i === rawWords.length) return 0;
    // Redirection at the end: > file or >> file.
    let words = rawWords.slice(i);
    let target: { file: string; append: boolean } | null = null;
    const r = words.findIndex((w) => w === ">" || w === ">>");
    if (r >= 0) {
      const file = words[r + 1];
      if (!file)
        throw new BashError("syntax error: file name expected after >");
      target = { file: expand(file, false)[0], append: words[r] === ">>" };
      words = words.slice(0, r);
    }
    const args = words.flatMap((w) => expand(w));
    const [name, ...rest] = args;
    const printed: string[] = [];
    const print = (line: string) => printed.push(line);
    let code = 0;
    switch (name) {
      case "echo": {
        const flagless = rest[0] === "-n" ? rest.slice(1) : rest;
        print(flagless.join(" "));
        break;
      }
      case "[":
      case "[[": {
        const close = name === "[" ? "]" : "]]";
        if (rest.at(-1) !== close)
          throw new BashError(`${name}: missing “${close}”`);
        code = test(rest.slice(0, -1)) ? 0 : 1;
        break;
      }
      case "test":
        code = test(rest) ? 0 : 1;
        break;
      case "true":
        break;
      case "false":
        code = 1;
        break;
      case "ls":
        print(Object.keys(state.files).sort().join("  "));
        break;
      case "cat":
        for (const f of rest) lines(fileText(f)).forEach(print);
        break;
      case "wc": {
        const files = rest.filter((a) => a !== "-l");
        for (const f of files) print(`${lines(fileText(f)).length} ${f}`);
        break;
      }
      case "grep": {
        const flags = rest.filter((a) => a.startsWith("-"));
        const [pattern, ...files] = rest.filter((a) => !a.startsWith("-"));
        if (pattern === undefined)
          throw new BashError("grep: pattern expected");
        const ignore = flags.includes("-i");
        const count = flags.includes("-c");
        const quiet = flags.includes("-q");
        let found = 0;
        for (const f of files) {
          const hits = lines(fileText(f)).filter((l) =>
            ignore
              ? l.toLowerCase().includes(pattern.toLowerCase())
              : l.includes(pattern),
          );
          found += hits.length;
          if (!count && !quiet)
            hits.forEach((h) => print(files.length > 1 ? `${f}:${h}` : h));
        }
        if (count && !quiet) print(String(found));
        code = found ? 0 : 1;
        break;
      }
      case "touch":
        for (const f of rest) state.files[f] ??= "";
        break;
      case "sleep":
        break;
      case "exit":
        throw new Exit(Number(rest[0] ?? state.status) || 0);
      default:
        state.status = 127;
        throw new BashError(`${name}: command not found`);
    }
    if (target) {
      const text = printed.map((l) => `${l}\n`).join("");
      state.files[target.file] = target.append
        ? (state.files[target.file] ?? "") + text
        : text;
    } else printed.forEach(say);
    return code;
  };

  const exec = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.kind === "cmd") {
        state.status = command(node.words);
      } else if (node.kind === "andor") {
        state.status = command(node.parts[0]);
        node.ops.forEach((op, i) => {
          if ((op === "and") === (state.status === 0))
            state.status = command(node.parts[i + 1]);
        });
      } else if (node.kind === "for") {
        const items = node.items
          ? node.items.flatMap((w) => expand(w))
          : [...state.args];
        for (const item of items) {
          if (++steps > MAX_STEPS)
            throw new BashError(
              "stopped: too many steps — is the loop endless?",
            );
          state.vars[node.name] = item;
          assigned.push(node.name);
          exec(node.body);
        }
      } else if (node.kind === "while") {
        for (;;) {
          exec(node.cond);
          const ok = state.status === 0;
          if (node.until ? ok : !ok) break;
          exec(node.body);
        }
        state.status = 0;
      } else {
        let done = false;
        for (const branch of node.branches) {
          exec(branch.cond);
          if (state.status === 0) {
            exec(branch.body);
            done = true;
            break;
          }
        }
        if (!done && node.otherwise) exec(node.otherwise);
        if (!done && !node.otherwise) state.status = 0;
      }
    }
  };

  try {
    exec(parse(source));
    return { output, error: null, state, assigned };
  } catch (e) {
    if (e instanceof Exit) {
      state.status = e.code;
      return { output, error: null, state, assigned };
    }
    if (e instanceof BashError)
      return { output, error: `bash: ${e.message}`, state, assigned };
    throw e;
  }
}

export const emptyState = (files: Files = {}, args: string[] = []): State => ({
  vars: {},
  files,
  args,
  status: 0,
});
