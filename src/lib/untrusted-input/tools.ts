// Academy Intermediate · Untrusted input: the pretend back end the lessons
// attack. Everything runs in the browser on made-up data: a tiny SQL engine
// for one login query, a file server
// and an HTML template. Nothing here touches a real system.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- SQL ------------------------------------------------------------------

export type User = { id: number; name: string; pass: string; role: string };

/** The lab's users table. Passwords are plain only to keep the query short. */
export const USERS: User[] = [
  { id: 1, name: "admin", pass: "Xk9#qT2!vLr8", role: "admin" },
  { id: 2, name: "ali", pass: "olma-2026", role: "user" },
  { id: 3, name: "madina", pass: "qalam-77", role: "user" },
];

export const loginQuery = (name: string, pass: string) =>
  `SELECT * FROM users WHERE name = '${name}' AND pass = '${pass}'`;
export const PARAM_QUERY = "SELECT * FROM users WHERE name = ? AND pass = ?";

type Token =
  | { kind: "word"; value: string }
  | { kind: "string"; value: string }
  | { kind: "number"; value: number }
  | { kind: "op"; value: string };

export type SqlResult =
  { ok: true; rows: User[] } | { ok: false; error: string };

class SqlError extends Error {}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) i++;
    else if (sql.startsWith("--", i) || c === "#") break;
    else if (sql.startsWith("/*", i)) {
      const end = sql.indexOf("*/", i + 2);
      if (end < 0) break;
      i = end + 2;
    } else if (c === "'") {
      let value = "";
      i++;
      for (;;) {
        if (i >= sql.length)
          throw new SqlError(`unrecognized token: "'${value}"`);
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            value += "'";
            i += 2;
            continue;
          }
          i++;
          break;
        }
        value += sql[i++];
      }
      tokens.push({ kind: "string", value });
    } else if (/[0-9]/.test(c)) {
      const match = /^[0-9]+/.exec(sql.slice(i))![0];
      tokens.push({ kind: "number", value: Number(match) });
      i += match.length;
    } else if (/[A-Za-z_*]/.test(c)) {
      const match = /^(\*|[A-Za-z_][A-Za-z0-9_]*)/.exec(sql.slice(i))![0];
      tokens.push({ kind: "word", value: match });
      i += match.length;
    } else {
      const op = ["!=", "<>", "<=", ">=", "=", "<", ">", "(", ")", ";"].find(
        (o) => sql.startsWith(o, i),
      );
      if (!op) throw new SqlError(`near "${c}": syntax error`);
      tokens.push({ kind: "op", value: op });
      i += op.length;
    }
  }
  return tokens;
}

type Value = string | number | boolean;
type Expr = (row: User) => Value;
const COLUMNS = ["id", "name", "pass", "role"] as const;

/** Runs the one query shape the lab uses: SELECT * FROM users WHERE … */
export function runSql(sql: string): SqlResult {
  try {
    const tokens = tokenize(sql);
    let at = 0;
    const peek = () => tokens[at];
    const isWord = (word: string) =>
      peek()?.kind === "word" &&
      (peek()!.value as string).toUpperCase() === word;
    const isOp = (op: string) => peek()?.kind === "op" && peek()!.value === op;
    const near = () => {
      const token = peek();
      return token ? `near "${token.value}": syntax error` : "incomplete input";
    };
    const expectWord = (word: string) => {
      if (!isWord(word)) throw new SqlError(near());
      at++;
    };
    for (const word of ["SELECT", "*", "FROM", "USERS", "WHERE"])
      expectWord(word);

    const truthy = (v: Value) =>
      typeof v === "boolean" ? v : typeof v === "number" ? v !== 0 : false;
    const compare = (a: Value, op: string, b: Value): boolean => {
      // Loose like SQLite: numbers compare as numbers, everything else as text.
      const x = typeof a === "number" && typeof b === "number" ? a : String(a);
      const y = typeof a === "number" && typeof b === "number" ? b : String(b);
      switch (op) {
        case "=":
          return x === y;
        case "!=":
        case "<>":
          return x !== y;
        case "<":
          return x < y;
        case ">":
          return x > y;
        case "<=":
          return x <= y;
        default:
          return x >= y;
      }
    };

    const atom = (): Expr => {
      const token = peek();
      if (!token) throw new SqlError("incomplete input");
      if (isOp("(")) {
        at++;
        const inner = or();
        if (!isOp(")")) throw new SqlError(near());
        at++;
        return inner;
      }
      at++;
      if (token.kind === "string" || token.kind === "number") {
        const value = token.value;
        return () => value;
      }
      if (token.kind === "word") {
        const upper = token.value.toUpperCase();
        if (upper === "TRUE") return () => true;
        if (upper === "FALSE") return () => false;
        const column = COLUMNS.find((c) => c === token.value.toLowerCase());
        if (column) return (row) => row[column];
        throw new SqlError(`no such column: ${token.value}`);
      }
      at--;
      throw new SqlError(near());
    };
    const comparison = (): Expr => {
      const left = atom();
      const token = peek();
      if (
        token?.kind === "op" &&
        ["=", "!=", "<>", "<", ">", "<=", ">="].includes(token.value)
      ) {
        at++;
        const right = atom();
        return (row) => compare(left(row), token.value, right(row));
      }
      return left;
    };
    const not = (): Expr => {
      if (isWord("NOT")) {
        at++;
        const inner = not();
        return (row) => !truthy(inner(row));
      }
      return comparison();
    };
    const and = (): Expr => {
      let left = not();
      while (isWord("AND")) {
        at++;
        const l = left;
        const r = not();
        left = (row) => truthy(l(row)) && truthy(r(row));
      }
      return left;
    };
    const or = (): Expr => {
      let left = and();
      while (isWord("OR")) {
        at++;
        const l = left;
        const r = and();
        left = (row) => truthy(l(row)) || truthy(r(row));
      }
      return left;
    };

    const where = or();
    if (isOp(";")) at++;
    if (at < tokens.length) throw new SqlError(near());
    return { ok: true, rows: USERS.filter((row) => truthy(where(row))) };
  } catch (error) {
    if (error instanceof SqlError) return { ok: false, error: error.message };
    throw error;
  }
}

/** A prepared statement: the values are data, never part of the query. */
export const runParameterized = (name: string, pass: string): User[] =>
  USERS.filter((u) => u.name === name && u.pass === pass);

/** The account the login form lets in: the first row, as most code does. */
export const loggedInAs = (result: SqlResult) =>
  result.ok ? (result.rows[0] ?? null) : null;

// --- Files ----------------------------------------------------------------

export const FILE_ROOT = "/srv/files";
export const SECRET = "DB_PASSWORD=Sir-2026-Maxfiy";
const DISK: Record<string, string> = {
  "/srv/files/menu.txt": "Dushanba: palov · Seshanba: lag‘mon",
  "/srv/files/report.txt": "Choraklik hisobot: sotuv 12% o‘sdi.",
  "/srv/app/config.env": `APP_ENV=production\n${SECRET}`,
  "/etc/passwd":
    "root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
};
export const SECRET_FILE = "/srv/app/config.env";

/** Resolves "." and ".." the way the operating system does. */
export function normalize(path: string) {
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return `/${out.join("/")}`;
}

export type Download = {
  /** What the server received after URL decoding. */
  param: string;
  /** After the filter, when there is one. */
  filtered: string;
  path: string;
  body: string | null;
  /** True when the safe check would have refused it. */
  outside: boolean;
};

/**
 * The download handler: /download?file=… is URL-decoded, optionally passed
 * through a naive filter that deletes "../" once, joined to /srv/files and
 * read from disk.
 */
export function download(file: string, filter: boolean): Download {
  let param: string;
  try {
    param = decodeURIComponent(file);
  } catch {
    param = file;
  }
  const filtered = filter ? param.split("../").join("") : param;
  const path = normalize(`${FILE_ROOT}/${filtered}`);
  return {
    param,
    filtered,
    path,
    body: DISK[path] ?? null,
    outside: !path.startsWith(`${FILE_ROOT}/`),
  };
}

// --- Validation -----------------------------------------------------------

/** The usernames the allowlist must accept or refuse. */
export const USERNAME_CASES: { value: string; ok: boolean }[] = [
  { value: "ali_2010", ok: true },
  { value: "madina", ok: true },
  { value: "bek", ok: true },
  { value: "ab", ok: false },
  { value: "Ali", ok: false },
  { value: "ali;rm -rf /", ok: false },
  { value: "a".repeat(17), ok: false },
  { value: "x' OR '1'='1", ok: false },
  { value: "ali\n", ok: false },
];
export const USERNAME_RULE = t(
  "3–16 belgi: kichik lotin harflari, raqamlar va “_”.",
  "3–16 characters: lowercase Latin letters, digits and “_”.",
);

export type RegexCheck =
  { ok: true; results: boolean[] } | { ok: false; error: string };

/** Tests the student's pattern on every case (the pattern runs as written). */
export function checkPattern(pattern: string): RegexCheck {
  if (pattern.length > 80) return { ok: false, error: "too long" };
  try {
    const re = new RegExp(pattern);
    return { ok: true, results: USERNAME_CASES.map((c) => re.test(c.value)) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

// --- Output encoding ------------------------------------------------------

/** Escapes only < and >, which is not enough inside an attribute. */
export const escapeTags = (s: string) =>
  s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Full HTML escaping: safe in element text and quoted attributes. */
export const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const TEXT_TEMPLATE = (name: string) => `<p>Salom, ${name}!</p>`;
export const ATTR_TEMPLATE = (name: string) =>
  `<input name="ism" value="${name}">`;

/** Does the value, placed in the template, start new markup of its own? */
export const breaksText = (value: string) => /<[a-z!/]/i.test(value);
export const breaksAttribute = (value: string) => value.includes('"');
