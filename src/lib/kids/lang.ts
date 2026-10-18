// Academy Kids' tiny "game code": one setting per line, in Uzbek.
//
//   tezlik = 8                       a number
//   kema_rangi = "qizil"             a colour from COLORS
//   ko'rinmas = ha                   yes / no
//   agar ochko > 50 bo'lsa kema_rangi = "oltin"   a one-line rule
//
// Nothing here is ever executed as JavaScript: lines are matched against the
// game's schema, so a child can type anything without breaking the page.

export type Text = { uz: string; en: string };
export type Value = number | string | boolean;

export type VarSpec = { label: Text } & (
  | { kind: "number"; default: number; min: number; max: number }
  | { kind: "bool"; default: boolean }
  | { kind: "color"; default: string }
);
export type Schema = Record<string, VarSpec>;

export type Op = ">" | "<" | ">=" | "<=" | "=";
/** "agar <watch> <op> <value> bo'lsa <name> = <set>" */
export type Rule = {
  line: number;
  watch: string;
  op: Op;
  value: number;
  name: string;
  set: Value;
};
export type Problem = { line: number; message: Text };
export type Program = {
  values: Record<string, Value>;
  rules: Rule[];
  problems: Problem[];
  /** Settings the code gives a value different from the default. */
  changed: string[];
};

export const COLORS: Record<string, string> = {
  "ko'k": "#4da3ff",
  qizil: "#ff5c5c",
  yashil: "#3ddc84",
  sariq: "#ffd43b",
  oltin: "#ffb829",
  pushti: "#ff7ac6",
  binafsha: "#a47bff",
  "to'q_sariq": "#ff9233",
  oq: "#f4f4f6",
  kumush: "#b8c4d6",
  qora: "#3a3a44",
};

const YES = new Set(["ha", "true", "rost"]);
const NO = new Set(["yo'q", "false", "yolg'on"]);

/** Turns every kind of apostrophe into "'" and lowercases. */
export function normalize(text: string) {
  return text.replace(/[‘’ʻʼ`´]/g, "'").toLowerCase();
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length];
}

/** The closest known name, for "did you mean" hints. */
export function suggest(name: string, names: string[]) {
  let best: string | null = null;
  let bestScore = 3;
  for (const candidate of names) {
    const score = distance(name, candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

type Parsed = { ok: true; value: Value } | { ok: false; message: Text };

function parseValue(name: string, raw: string, spec: VarSpec): Parsed {
  const text = raw.trim().replace(/;$/, "").trim();
  if (spec.kind === "number") {
    if (!/^-?\d+(\.\d+)?$/.test(text))
      return {
        ok: false,
        message: {
          uz: `${name} son bo‘lishi kerak, masalan: ${name} = ${spec.default}`,
          en: `${name} must be a number, for example: ${name} = ${spec.default}`,
        },
      };
    const value = Number(text);
    if (value < spec.min || value > spec.max)
      return {
        ok: false,
        message: {
          uz: `${name} ${spec.min} dan ${spec.max} gacha bo‘lishi mumkin.`,
          en: `${name} can be from ${spec.min} to ${spec.max}.`,
        },
      };
    return { ok: true, value };
  }
  if (spec.kind === "bool") {
    if (YES.has(text)) return { ok: true, value: true };
    if (NO.has(text)) return { ok: true, value: false };
    return {
      ok: false,
      message: {
        uz: `${name} uchun “ha” yoki “yo'q” yozing.`,
        en: `Write “ha” (yes) or “yo'q” (no) for ${name}.`,
      },
    };
  }
  const color = text.replace(/^"(.*)"$/, "$1").trim();
  if (color in COLORS) return { ok: true, value: color };
  const close = suggest(color, Object.keys(COLORS));
  return {
    ok: false,
    message: {
      uz: close
        ? `“${color}” degan rang yo‘q. Balki “${close}”?`
        : `Bunday rang yo‘q. Ranglar: ${Object.keys(COLORS).join(", ")}.`,
      en: close
        ? `There is no colour “${color}”. Did you mean “${close}”?`
        : `Unknown colour. Colours: ${Object.keys(COLORS).join(", ")}.`,
    },
  };
}

function unknownName(name: string, names: string[]): Text {
  const close = suggest(name, names);
  return close
    ? {
        uz: `“${name}” degan sozlama yo‘q. Balki “${close}”?`,
        en: `There is no setting “${name}”. Did you mean “${close}”?`,
      }
    : {
        uz: `“${name}” degan sozlama yo‘q.`,
        en: `There is no setting “${name}”.`,
      };
}

const NAME = "[a-z_'][a-z0-9_']*";
const ASSIGN = new RegExp(`^(${NAME})\\s*=\\s*(.+)$`);
const RULE = new RegExp(
  `^agar\\s+(${NAME})\\s*(>=|<=|==|=|>|<)\\s*(-?\\d+)\\s*(?:bo'lsa\\s*:?|:)\\s*(.+)$`,
);

export const DEFAULTS = (schema: Schema) =>
  Object.fromEntries(
    Object.entries(schema).map(([name, spec]) => [name, spec.default]),
  ) as Record<string, Value>;

/**
 * Reads a child's code. Lines that cannot be understood are reported and
 * skipped; every other line still applies, so one typo never stops the game.
 */
export function parse(code: string, schema: Schema, watch: string[]): Program {
  const names = Object.keys(schema);
  const values = DEFAULTS(schema);
  const rules: Rule[] = [];
  const problems: Problem[] = [];
  const lines = code.split("\n").slice(0, 200);
  lines.forEach((source, index) => {
    const line = index + 1;
    const text = normalize(source)
      .replace(/(\/\/|#).*$/, "")
      .trim();
    if (!text) return;
    const rule = RULE.exec(text);
    if (rule) {
      const [, watched, op, number, rest] = rule;
      if (!watch.includes(watched)) {
        problems.push({
          line,
          message: {
            uz: `“agar” faqat ${watch.join(", ")} bilan ishlaydi.`,
            en: `“agar” (if) only works with ${watch.join(", ")}.`,
          },
        });
        return;
      }
      const assign = ASSIGN.exec(rest.trim());
      if (!assign) {
        problems.push({
          line,
          message: {
            uz: `“bo'lsa” dan keyin sozlama yozing, masalan: kema_rangi = "oltin"`,
            en: `After “bo'lsa” (then) write a setting, for example: kema_rangi = "oltin"`,
          },
        });
        return;
      }
      const [, name, raw] = assign;
      const spec = schema[name];
      if (!spec) {
        problems.push({ line, message: unknownName(name, names) });
        return;
      }
      const parsed = parseValue(name, raw, spec);
      if (!parsed.ok) {
        problems.push({ line, message: parsed.message });
        return;
      }
      rules.push({
        line,
        watch: watched,
        op: (op === "==" ? "=" : op) as Op,
        value: Number(number),
        name,
        set: parsed.value,
      });
      return;
    }
    const assign = ASSIGN.exec(text);
    if (!assign) {
      problems.push({
        line,
        message: {
          uz: "Bu qatorni tushunmadim. Namuna: tezlik = 5",
          en: "I did not understand this line. Example: tezlik = 5",
        },
      });
      return;
    }
    const [, name, raw] = assign;
    const spec = schema[name];
    if (!spec) {
      problems.push({ line, message: unknownName(name, names) });
      return;
    }
    const parsed = parseValue(name, raw, spec);
    if (!parsed.ok) {
      problems.push({ line, message: parsed.message });
      return;
    }
    values[name] = parsed.value;
  });
  const defaults = DEFAULTS(schema);
  return {
    values,
    rules: rules.slice(0, 20),
    problems,
    changed: names.filter((name) => values[name] !== defaults[name]),
  };
}

function holds(op: Op, left: number, right: number) {
  switch (op) {
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      return left === right;
  }
}

/** The settings in force right now: the code's values with rules applied. */
export function effective(
  values: Record<string, Value>,
  rules: Rule[],
  runtime: Record<string, number>,
) {
  const result = { ...values };
  for (const rule of rules)
    if (holds(rule.op, runtime[rule.watch] ?? 0, rule.value))
      result[rule.name] = rule.set;
  return result;
}

/** A setting as the line the code panel would show. */
export function formatValue(spec: VarSpec, value: Value) {
  if (spec.kind === "bool") return value ? "ha" : "yo'q";
  if (spec.kind === "color") return `"${value}"`;
  return String(value);
}
