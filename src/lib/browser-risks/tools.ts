// Academy Intermediate · Browser-side risks: the pretend browser the lessons
// use. A small HTML reader that only describes what a page would build (it
// never renders or runs anything), a Content-Security-Policy checker for one
// page's resources, and a bank whose transfer form a foreign site submits.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Reading markup ---------------------------------------------------------

export type Attr = { name: string; value: string };
export type Node =
  | { kind: "text"; text: string }
  | { kind: "element"; tag: string; attrs: Attr[] };

/**
 * What `element.innerHTML = value` would create, read with a simplified
 * HTML tokenizer: text, and the start tag of each element with its
 * attributes. Closing tags and comments are skipped.
 */
export function readMarkup(html: string): Node[] {
  const out: Node[] = [];
  const re =
    /<!--[\s\S]*?-->|<\/[a-z][^>]*>|<([a-z][a-z0-9-]*)(\s[^>]*)?\/?>/gi;
  let at = 0;
  for (const m of html.matchAll(re)) {
    if (m.index > at) out.push({ kind: "text", text: html.slice(at, m.index) });
    at = m.index + m[0].length;
    if (!m[1]) continue;
    const attrs: Attr[] = [];
    const attrRe = /([^\s"'=<>/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const a of (m[2] ?? "").matchAll(attrRe))
      attrs.push({
        name: a[1].toLowerCase(),
        value: a[3] ?? a[4] ?? a[5] ?? "",
      });
    out.push({ kind: "element", tag: m[1].toLowerCase(), attrs });
  }
  if (at < html.length) out.push({ kind: "text", text: html.slice(at) });
  return out;
}

export type Danger = { tag: string; why: Text };

/** Elements and attributes in a fragment that could run code. */
export function dangers(nodes: Node[]): Danger[] {
  const found: Danger[] = [];
  for (const node of nodes) {
    if (node.kind !== "element") continue;
    if (["script", "iframe", "object", "embed"].includes(node.tag))
      found.push({
        tag: node.tag,
        why: t(
          `<${node.tag}> sahifaga boshqa kod yoki sahifa olib kiradi.`,
          `<${node.tag}> brings other code or another page into the page.`,
        ),
      });
    for (const a of node.attrs) {
      if (a.name.startsWith("on"))
        found.push({
          tag: node.tag,
          why: t(
            `“${a.name}” atributi — hodisa sodir bo‘lganda ishlaydigan kod.`,
            `The “${a.name}” attribute is code that runs when the event happens.`,
          ),
        });
      if (
        ["href", "src", "action", "formaction"].includes(a.name) &&
        !linkAllowed(a.value)
      )
        found.push({
          tag: node.tag,
          why: t(
            `${a.name}="${a.value}" — ruxsat etilmagan manzil sxemasi.`,
            `${a.name}="${a.value}" uses a scheme that is not allowed.`,
          ),
        });
    }
  }
  return found;
}

/** Only web addresses (or paths on this site) may go into a link. */
export function linkAllowed(raw: string) {
  try {
    const url = new URL(raw.trim(), "https://kitob.cybervalue.uz/");
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// --- Content-Security-Policy ------------------------------------------------

export type Resource = {
  id: string;
  label: Text;
  code: string;
  type: "script" | "style" | "img";
  /** Where it comes from: this site, another origin, or written in the page. */
  from: "self" | "inline" | string;
  /** Does the page need it, or did an attacker inject it? */
  needed: boolean;
};

export const PAGE: Resource[] = [
  {
    id: "app",
    label: t("Saytning o‘z skripti", "The site’s own script"),
    code: '<script src="/app.js">',
    type: "script",
    from: "self",
    needed: true,
  },
  {
    id: "style",
    label: t("Saytning o‘z uslublari", "The site’s own styles"),
    code: '<link rel="stylesheet" href="/style.css">',
    type: "style",
    from: "self",
    needed: true,
  },
  {
    id: "stats",
    label: t("Statistika xizmati", "The statistics service"),
    code: '<script src="https://cdn.stats.example/s.js">',
    type: "script",
    from: "https://cdn.stats.example",
    needed: true,
  },
  {
    id: "photos",
    label: t("Kitob muqovalari", "Book covers"),
    code: '<img src="https://img.kitob.example/12.jpg">',
    type: "img",
    from: "https://img.kitob.example",
    needed: true,
  },
  {
    id: "injected",
    label: t(
      "Izohga yashirilgan skript (hujum)",
      "A script hidden in a comment (attack)",
    ),
    code: "<script>…</script>",
    type: "script",
    from: "inline",
    needed: false,
  },
  {
    id: "handler",
    label: t(
      "Rasm atributidagi kod (hujum)",
      "Code in an image attribute (attack)",
    ),
    code: '<img src="x" onerror="…">',
    type: "script",
    from: "inline",
    needed: false,
  },
  {
    id: "foreign",
    label: t(
      "Begona saytdan skript (hujum)",
      "A script from a foreign site (attack)",
    ),
    code: '<script src="https://evil.example/x.js">',
    type: "script",
    from: "https://evil.example",
    needed: false,
  },
];

/** The directives the student can put together. */
export const DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "script-src 'self' https://cdn.stats.example",
  "script-src 'self' 'unsafe-inline'",
  "script-src *",
  "img-src 'self' https://img.kitob.example",
  "img-src *",
  "object-src 'none'",
] as const;

export type Verdict = { allowed: boolean; by: string | null };

/**
 * How the browser applies the chosen directives to each resource. As in
 * CSP, the first directive of a name counts and default-src stands in for
 * a missing one; with no policy at all everything loads.
 */
export function applyPolicy(chosen: readonly string[]) {
  const policy = new Map<string, string[]>();
  for (const directive of chosen) {
    const [name, ...sources] = directive.split(/\s+/);
    if (!policy.has(name)) policy.set(name, sources);
  }
  const ignored = chosen.filter(
    (d, i) =>
      chosen.findIndex((e) => e.split(/\s+/)[0] === d.split(/\s+/)[0]) !== i,
  );
  const verdicts = new Map<string, Verdict>();
  for (const r of PAGE) {
    const name = policy.has(`${r.type}-src`) ? `${r.type}-src` : "default-src";
    const sources = policy.get(name);
    if (!sources) {
      verdicts.set(r.id, { allowed: true, by: null });
      continue;
    }
    const allowed =
      r.from === "inline"
        ? sources.includes("'unsafe-inline'")
        : sources.includes("*") ||
          (r.from === "self" && sources.includes("'self'")) ||
          sources.includes(r.from);
    verdicts.set(r.id, { allowed, by: name });
  }
  return { verdicts, ignored };
}

/** The page works and every attack is blocked. */
export const policyRight = (chosen: readonly string[]) => {
  const { verdicts } = applyPolicy(chosen);
  return PAGE.every((r) => verdicts.get(r.id)!.allowed === r.needed);
};

// --- Cross-site request forgery ---------------------------------------------

export type SameSite = "None" | "Lax" | "Strict";
export type BankSetup = { sameSite: SameSite; token: boolean };
export type Attempt = {
  /** Which page sends the transfer. */
  from: "bank" | "evil";
  cookieSent: boolean;
  tokenOk: boolean;
  accepted: boolean;
};

/**
 * A transfer form posted to bank.cybervalue.uz, by the bank's own page and
 * by a foreign page that submits a hidden copy. The browser attaches the
 * session cookie by its SameSite rule; the bank then wants the session
 * and, when switched on, the per-form token only its own page knows.
 */
export function transfer(setup: BankSetup, from: Attempt["from"]): Attempt {
  // A cross-site POST carries the cookie only with SameSite=None.
  const cookieSent = from === "bank" || setup.sameSite === "None";
  const tokenOk = !setup.token || from === "bank";
  return { from, cookieSent, tokenOk, accepted: cookieSent && tokenOk };
}

/** Real users can still pay and the forged request is refused. */
export const bankSafe = (setup: BankSetup) =>
  transfer(setup, "bank").accepted && !transfer(setup, "evil").accepted;
