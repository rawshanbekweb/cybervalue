// Academy Kids' tiny "game code": one setting per line, in Uzbek.
//
//   tezlik = 8                       a number
//   kema_rangi = "qizil"             a colour from COLORS
//   ko'rinmas = ha                   yes / no
//   agar ochko > 50 bo'lsa kema_rangi = "oltin"   a one-line rule
//
//   agar ochko > 50 va hayotlar < 2 bo'lsa:      a block: indented lines
//       kema_rangi = "qizil"                     apply while it holds,
//   aks_holda:                                   the "aks_holda" block
//       kema_rangi = "ko'k"                      while it does not
//
//   qachon yulduz_olinsa:                        an event handler (developer
//       ochko += 5                               mode): runs each time the
//       xabar("Zo'r!")                           game reports the event
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
export type Cond = { watch: string; op: Op; value: number };
/**
 * "agar <conds> bo'lsa <name> = <set>": applies while every condition holds,
 * or, for a line of an "aks_holda" block, while they do not.
 */
export type Rule = {
  line: number;
  when: Cond[];
  otherwise: boolean;
  name: string;
  set: Value;
};
export type Action =
  | { kind: "add"; name: string; amount: number }
  | { kind: "set"; name: string; value: Value }
  | { kind: "say"; text: string };
/** "qachon <event>:" followed by indented actions. */
export type Handler = { line: number; event: string; actions: Action[] };
export type Problem = { line: number; message: Text };
export type Program = {
  values: Record<string, Value>;
  rules: Rule[];
  handlers: Handler[];
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
const CHANGE = new RegExp(`^(${NAME})\\s*(\\+=|-=)\\s*(-?\\d+)$`);
const SAY = /^xabar\s*\(\s*"([^"]{0,40})"\s*\)$/;
const COND = new RegExp(`^(${NAME})\\s*(>=|<=|==|=|>|<)\\s*(-?\\d+)$`);
const IF = /^agar\s+(.+?)\s*(?:bo'lsa\s*:?|:)\s*(.*)$/;
const ELSE = /^aks_holda\s*:?$/;
const WHEN = new RegExp(`^qachon\\s+(${NAME})\\s*:?$`);
/** Values an event handler may change besides the settings. */
export const LIVE = ["ochko", "hayotlar"];

export const DEFAULTS = (schema: Schema) =>
  Object.fromEntries(
    Object.entries(schema).map(([name, spec]) => [name, spec.default]),
  ) as Record<string, Value>;

export type Features = {
  /** Event names the game reports; handlers are allowed when given. */
  events?: string[];
};

type Block =
  | { kind: "if"; when: Cond[]; otherwise: boolean }
  | { kind: "when"; handler: Handler };

/**
 * Reads a child's code. Lines that cannot be understood are reported and
 * skipped; every other line still applies, so one typo never stops the game.
 */
export function parse(
  code: string,
  schema: Schema,
  watch: string[],
  features: Features = {},
): Program {
  const names = Object.keys(schema);
  const values = DEFAULTS(schema);
  const rules: Rule[] = [];
  const handlers: Handler[] = [];
  const problems: Problem[] = [];
  const lines = code.split("\n").slice(0, 200);
  let block: Block | null = null;
  // The last "agar" block, which an "aks_holda" right after it reverses.
  let lastIf: Cond[] | null = null;

  const fail = (line: number, message: Text) =>
    problems.push({ line, message });

  /** "name = value" for a setting; null after reporting a problem. */
  const setting = (line: number, text: string) => {
    const assign = ASSIGN.exec(text);
    if (!assign) return null;
    const [, name, raw] = assign;
    const spec = schema[name];
    if (!spec) {
      fail(line, unknownName(name, names));
      return false;
    }
    const parsed = parseValue(name, raw, spec);
    if (!parsed.ok) {
      fail(line, parsed.message);
      return false;
    }
    return { name, value: parsed.value };
  };

  const conditions = (line: number, text: string): Cond[] | null => {
    const when: Cond[] = [];
    for (const part of text.split(/\s+va\s+/)) {
      const cond = COND.exec(part.trim());
      if (!cond) {
        fail(line, {
          uz: "Shartni tushunmadim. Namuna: agar ochko > 50 bo'lsa",
          en: "I did not understand the condition. Example: agar ochko > 50 bo'lsa",
        });
        return null;
      }
      const [, watched, op, number] = cond;
      if (!watch.includes(watched)) {
        fail(line, {
          uz: `“agar” faqat ${watch.join(", ")} bilan ishlaydi.`,
          en: `“agar” (if) only works with ${watch.join(", ")}.`,
        });
        return null;
      }
      when.push({
        watch: watched,
        op: (op === "==" ? "=" : op) as Op,
        value: Number(number),
      });
    }
    return when.slice(0, 3);
  };

  const action = (
    line: number,
    text: string,
    source: string,
  ): Action | null => {
    // The message keeps the child's own capitals.
    if (SAY.test(text))
      return {
        kind: "say",
        text: /xabar\s*\(\s*"([^"]{0,40})"/i.exec(source)?.[1] ?? "",
      };
    const change = CHANGE.exec(text);
    if (change) {
      const [, name, sign, number] = change;
      const amount = Number(number) * (sign === "-=" ? -1 : 1);
      if (LIVE.includes(name)) return { kind: "add", name, amount };
      const spec = schema[name];
      if (!spec) {
        fail(line, unknownName(name, [...names, ...LIVE]));
        return null;
      }
      if (spec.kind !== "number") {
        fail(line, {
          uz: `${name} son emas, unga qo‘shib bo‘lmaydi. Yozing: ${name} = ...`,
          en: `${name} is not a number, so you cannot add to it. Write: ${name} = ...`,
        });
        return null;
      }
      return { kind: "add", name, amount };
    }
    const set = setting(line, text);
    if (set) return { kind: "set", name: set.name, value: set.value };
    if (set === null)
      fail(line, {
        uz: `Bu yerda buyruq yozing, masalan: ochko += 5 yoki xabar("Zo'r!")`,
        en: `Write a command here, for example: ochko += 5 or xabar("Zo'r!")`,
      });
    return null;
  };

  lines.forEach((source, index) => {
    const line = index + 1;
    const indented = /^[ \t]+\S/.test(source);
    const text = normalize(source)
      .replace(/(\/\/|#).*$/, "")
      .trim();
    if (!text) return;

    if (indented && block) {
      if (block.kind === "when") {
        const a = action(line, text, source);
        if (a && block.handler.actions.length < 10)
          block.handler.actions.push(a);
        return;
      }
      const set = setting(line, text);
      if (set)
        rules.push({
          line,
          when: block.when,
          otherwise: block.otherwise,
          name: set.name,
          set: set.value,
        });
      else if (set === null)
        fail(line, {
          uz: `Blok ichida sozlama yozing, masalan: tezlik = 8`,
          en: `Inside the block write a setting, for example: tezlik = 8`,
        });
      return;
    }
    const opened = block;
    block = null;

    if (ELSE.test(text)) {
      const previous = opened?.kind === "if" && !opened.otherwise;
      if (!previous || !lastIf) {
        fail(line, {
          uz: "“aks_holda” faqat “agar … bo'lsa:” blokidan keyin keladi.",
          en: "“aks_holda” (else) only comes right after an “agar … bo'lsa:” block.",
        });
        return;
      }
      block = { kind: "if", when: lastIf, otherwise: true };
      return;
    }
    lastIf = null;

    const when = WHEN.exec(text);
    if (when) {
      const events = features.events;
      if (!events) {
        fail(line, {
          uz: "“qachon” dasturchi rejimida ochiladi. Avval maxfiy parolni toping!",
          en: "“qachon” (when) opens in developer mode. Find the secret password first!",
        });
        return;
      }
      const event = when[1];
      if (!events.includes(event)) {
        const close = suggest(event, events);
        fail(line, {
          uz: close
            ? `“${event}” degan hodisa yo‘q. Balki “${close}”?`
            : `Bunday hodisa yo‘q. Hodisalar: ${events.join(", ")}.`,
          en: close
            ? `There is no event “${event}”. Did you mean “${close}”?`
            : `Unknown event. Events: ${events.join(", ")}.`,
        });
        return;
      }
      const handler: Handler = { line, event, actions: [] };
      if (handlers.length < 10) handlers.push(handler);
      block = { kind: "when", handler };
      return;
    }

    const rule = IF.exec(text);
    if (rule) {
      const [, condText, rest] = rule;
      const when = conditions(line, condText);
      if (!when) return;
      if (!rest) {
        block = { kind: "if", when, otherwise: false };
        lastIf = when;
        return;
      }
      const set = setting(line, rest.trim());
      if (set) rules.push({ line, when, otherwise: false, ...pick(set) });
      else if (set === null)
        fail(line, {
          uz: `“bo'lsa” dan keyin sozlama yozing, masalan: kema_rangi = "oltin"`,
          en: `After “bo'lsa” (then) write a setting, for example: kema_rangi = "oltin"`,
        });
      return;
    }

    if (indented) {
      fail(line, {
        uz: "Bu qator surilgan, lekin tepada “agar” yoki “qachon” yo‘q.",
        en: "This line is indented, but there is no “agar” or “qachon” above it.",
      });
      return;
    }
    const set = setting(line, text);
    if (set) values[set.name] = set.value;
    else if (set === null)
      fail(line, {
        uz: "Bu qatorni tushunmadim. Namuna: tezlik = 5",
        en: "I did not understand this line. Example: tezlik = 5",
      });
  });
  const defaults = DEFAULTS(schema);
  return {
    values,
    rules: rules.slice(0, 20),
    handlers: handlers.filter((h) => h.actions.length > 0),
    problems,
    changed: names.filter((name) => values[name] !== defaults[name]),
  };
}

const pick = (set: { name: string; value: Value }) => ({
  name: set.name,
  set: set.value,
});

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
  for (const rule of rules) {
    const yes = rule.when.every((c) =>
      holds(c.op, runtime[c.watch] ?? 0, c.value),
    );
    if (yes !== rule.otherwise) result[rule.name] = rule.set;
  }
  return result;
}

export type Live = { ochko: number; hayotlar: number };
export type Fired = Live & {
  /** Settings changed by the handler, to keep for the rest of the round. */
  set: Record<string, Value>;
  say: string | null;
};

/**
 * Runs the handlers for one event. `current` is what is in force now; number
 * settings stay inside their range and the score never goes below zero.
 */
export function fire(
  handlers: Handler[],
  schema: Schema,
  event: string,
  current: Record<string, Value>,
  live: Live,
): Fired | null {
  const mine = handlers.filter((h) => h.event === event);
  if (!mine.length) return null;
  const out: Fired = { ...live, set: {}, say: null };
  for (const h of mine)
    for (const a of h.actions) {
      if (a.kind === "say") out.say = a.text;
      else if (a.name === "ochko" || a.name === "hayotlar") {
        if (a.kind !== "add") continue;
        out[a.name] = Math.min(
          Math.max(out[a.name] + a.amount, 0),
          a.name === "ochko" ? 1_000_000 : 99,
        );
      } else {
        const spec = schema[a.name];
        if (!spec) continue;
        if (a.kind === "set") out.set[a.name] = a.value;
        else if (spec.kind === "number") {
          const now = Number(
            out.set[a.name] ?? current[a.name] ?? spec.default,
          );
          out.set[a.name] = Math.min(
            Math.max(now + a.amount, spec.min),
            spec.max,
          );
        }
      }
    }
  return out;
}

/** A setting as the line the code panel would show. */
export function formatValue(spec: VarSpec, value: Value) {
  if (spec.kind === "bool") return value ? "ha" : "yo'q";
  if (spec.kind === "color") return `"${value}"`;
  return String(value);
}
