import { parse, type DefaultTreeAdapterMap } from "parse5";
import { questionsFor, variants } from "./challenge";
import type { Draft } from "./contract";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const isElement = (node: Node): node is Element => "tagName" in node;
const children = (node: Node): Node[] =>
  "childNodes" in node ? node.childNodes : [];
function walk(root: Node): Node[] {
  const all: Node[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    all.push(node);
    pending.push(...children(node));
  }
  return all;
}
const attr = (node: Element, name: string) =>
  node.attrs.find((a) => a.name === name)?.value;
const text = (node: Node) =>
  walk(node)
    .filter((n) => n.nodeName === "#text")
    .reverse()
    .map((n) => (n as DefaultTreeAdapterMap["textNode"]).value)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
const within = (node: Node | undefined, tag: string) =>
  node
    ? walk(node)
        .filter(isElement)
        .filter((n) => n.tagName === tag)
    : [];
const direct = (node: Node, tag: string) =>
  children(node)
    .filter(isElement)
    .filter((n) => n.tagName === tag);

export type Grade = {
  quiz: { id: string; points: number }[];
  practical: { label: string; points: number }[];
  restrictions: string[];
  quizScore: number;
  practicalScore: number;
  total: number;
};

export function gradeAttempt(
  variant: number,
  draft: Pick<Draft, "code" | "answers">,
): Grade {
  const v = variants[variant % variants.length];
  const errors: string[] = [];
  const doc = parse(draft.code, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => errors.push(error.code),
  });
  const nodes = walk(doc);
  const elements = nodes.filter(isElement);
  const find = (tag: string) => elements.filter((n) => n.tagName === tag);
  const byId = (id: string) => elements.filter((n) => attr(n, "id") === id);
  const main = find("main")[0];
  const header = find("header")[0];
  const footer = find("footer")[0];
  const form = byId("signup")[0];
  const schedule = byId("schedule")[0];
  const forbidden = new Set([
    "script",
    "style",
    "link",
    "iframe",
    "object",
    "embed",
    "base",
    "svg",
    "math",
    "template",
    "noscript",
    "frame",
    "frameset",
  ]);
  const restrictions: string[] = [];
  if (
    elements.some(
      (n) =>
        forbidden.has(n.tagName) ||
        n.attrs.some(
          (a) =>
            a.name.startsWith("on") ||
            ["style", "hidden", "srcdoc"].includes(a.name) ||
            (a.name === "aria-hidden" && a.value === "true") ||
            a.name === "http-equiv",
        ),
    )
  ) {
    restrictions.push(
      "CSS, JavaScript, yashirin mazmun yoki taqiqlangan faol element ishlatilgan. Amaliy qism 0 ball.",
    );
  }
  if (
    elements.some((n) =>
      n.attrs.some(
        (a) =>
          ["href", "src", "action", "formaction"].includes(a.name) &&
          !/^(?:#[a-zA-Z][\w-]*|\/icon\.svg|mailto:[\w.+-]+@example\.test|)$/.test(
            a.value,
          ),
      ),
    )
  ) {
    restrictions.push(
      "Faqat ichki #havola, /icon.svg va berilgan example.test email manziliga ruxsat. Amaliy qism 0 ball.",
    );
  }
  const ids = elements
    .map((n) => attr(n, "id"))
    .filter((id): id is string => id !== undefined);
  const uniqueIds = ids.every(Boolean) && new Set(ids).size === ids.length;
  const rows = within(schedule, "table")
    .flatMap((table) => within(table, "tr"))
    .reverse();
  const validTable =
    rows.length === 4 &&
    direct(rows[0], "th").map(text).join("|") === "Mashg‘ulot|Vaqt" &&
    rows
      .slice(1)
      .every(
        (row, i) =>
          direct(row, "td").map(text).join("|") ===
          `${v.items[i]}|${v.times[i]}`,
      );
  const inputValid = (type: string) =>
    within(form, "input").some((input) => {
      const id = attr(input, "id");
      return (
        attr(input, "type") === type &&
        Boolean(attr(input, "name")?.trim()) &&
        Boolean(id) &&
        byId(id!).length === 1 &&
        within(form, "label").some(
          (label) => attr(label, "for") === id && text(label).length >= 2,
        )
      );
    });
  const listValid = (tag: string) =>
    within(main, tag).some(
      (list) =>
        direct(list, "li").length >= 3 &&
        direct(list, "li").every((li) => text(li).length >= 3),
    );
  const checks: [string, boolean][] = [
    [
      "01 · Hujjat tuzilishi va title",
      errors.length === 0 &&
        doc.childNodes.some((n) => n.nodeName === "#documentType") &&
        ["html", "head", "body"].every((tag) =>
          Boolean(find(tag)[0]?.sourceCodeLocation),
        ) &&
        attr(find("html")[0], "lang") === "uz" &&
        within(find("head")[0], "title").some((n) => text(n) === v.name),
    ],
    [
      "02 · Semantik tuzilma",
      Boolean(
        header &&
        footer &&
        main &&
        find("main").length === 1 &&
        within(header, "nav").length &&
        form &&
        schedule &&
        walk(main).includes(form) &&
        walk(main).includes(schedule),
      ),
    ],
    [
      "03 · Sarlavhalar va kirish",
      find("h1").length === 1 &&
        text(find("h1")[0]) === v.name &&
        within(main, "h2").filter((n) => text(n).length >= 3).length >= 2 &&
        within(main, "p").some((n) => text(n).length >= 20),
    ],
    [
      "04 · Ishlaydigan ichki havolalar",
      uniqueIds &&
        ["schedule", "signup"].every(
          (id) =>
            byId(id).length === 1 &&
            Boolean(main && walk(main).includes(byId(id)[0])) &&
            within(header, "nav").some((nav) =>
              within(nav, "a").some(
                (a) => attr(a, "href") === `#${id}` && text(a).length >= 2,
              ),
            ),
        ) &&
        form?.tagName === "form",
    ],
    ["05 · Tartibli ro‘yxat", listValid("ol")],
    ["06 · Tartibsiz ro‘yxat", listValid("ul")],
    ["07 · Jadvalning tuzilishi va ma’lumoti", validTable],
    [
      "08 · Forma va label bog‘lanishi",
      form?.tagName === "form" &&
        inputValid("text") &&
        inputValid("email") &&
        within(form, "button").some(
          (n) => attr(n, "type") === "submit" && text(n).length >= 2,
        ),
    ],
    [
      "09 · Rasm va mazmunli tavsif",
      within(main, "img").some(
        (n) =>
          attr(n, "src") === "/icon.svg" &&
          (attr(n, "alt")?.trim().length ?? 0) >= 8,
      ),
    ],
    [
      "10 · Muhim matn, urg‘u va qator",
      ["strong", "em"].every((tag) =>
        within(main, tag).some((n) => text(n).length >= 5),
      ) &&
        within(footer, "br").length > 0 &&
        Boolean(footer && text(footer).length >= 10),
    ],
    [
      "11 · HTML entities",
      within(main, "p").some((n) => text(n) === "<input> & <label>"),
    ],
    [
      "12 · Guruhlash, izoh va aloqa",
      within(main, "div").some(
        (n) =>
          attr(n, "class")?.split(/\s+/).includes("note") &&
          within(n, "span").some((span) => text(span).length >= 3),
      ) &&
        nodes.some(
          (n) =>
            n.nodeName === "#comment" &&
            (n as DefaultTreeAdapterMap["commentNode"]).data.trim().length >=
              15 &&
            !(n as DefaultTreeAdapterMap["commentNode"]).data.includes(
              "Bu sahifadagi xatolarni",
            ),
        ) &&
        within(footer, "a").some(
          (n) =>
            attr(n, "href") === `mailto:${v.contact}` && text(n).length >= 3,
        ),
    ],
  ];
  const practical = checks.map(([label, pass]) => ({
    label,
    points: pass && !restrictions.length ? 5 : 0,
  }));
  const quiz = questionsFor(variant).map((q) => ({
    id: q.id,
    points: draft.answers[q.id] === q.correct ? 5 : 0,
  }));
  const quizScore = quiz.reduce((sum, q) => sum + q.points, 0);
  const practicalScore = practical.reduce((sum, c) => sum + c.points, 0);
  return {
    quiz,
    practical,
    restrictions,
    quizScore,
    practicalScore,
    total: quizScore + practicalScore,
  };
}
