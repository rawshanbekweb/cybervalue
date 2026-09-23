import { parse, type DefaultTreeAdapterMap } from "parse5";
import type { ProjectId } from "./projects";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
export type StudioCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};
export const elements = (root: Node): Element[] => {
  const result: Element[] = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.pop()!;
    if ("tagName" in node) result.push(node);
    if ("childNodes" in node) queue.push(...[...node.childNodes].reverse());
  }
  return result;
};
export const attribute = (element: Element, name: string) =>
  element.attrs.find((item) => item.name === name)?.value;
const content = (root: Node): string => {
  if (root.nodeName === "#text")
    return (root as DefaultTreeAdapterMap["textNode"]).value;
  return "childNodes" in root
    ? root.childNodes.map(content).join(" ").replace(/\s+/g, " ").trim()
    : "";
};
const inside = (root: Node | undefined, tag: string) =>
  root ? elements(root).filter((node) => node.tagName === tag) : [];
const direct = (root: Element, tag: string) =>
  root.childNodes.filter(
    (node): node is Element => "tagName" in node && node.tagName === tag,
  );
const meaningful = (node: Node | undefined, length = 3) =>
  !!node && content(node).trim().length >= length;
const explicit = (node: Element) => !!node.sourceCodeLocation;
export const FORBIDDEN_ELEMENTS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "base",
  "link",
  "svg",
  "math",
  "template",
  "frame",
  "frameset",
  "noscript",
]);

export function checkProject(project: ProjectId, html: string): StudioCheck[] {
  const parseErrors: string[] = [];
  const doc = parse(html.slice(0, 30000), {
    sourceCodeLocationInfo: true,
    onParseError: (error) => parseErrors.push(error.code),
  });
  const all = elements(doc);
  const find = (tag: string) => all.filter((node) => node.tagName === tag);
  const byId = (id: string) =>
    all.filter((node) => attribute(node, "id") === id);
  const main = find("main")[0];
  const checks: StudioCheck[] = [];
  const check = (id: string, label: string, passed: boolean, detail: string) =>
    checks.push({ id, label, passed, detail });
  check(
    "document",
    "Explicit document structure and language",
    doc.childNodes.some((node) => node.nodeName === "#documentType") &&
      ["html", "head", "body"].every((tag) => find(tag).some(explicit)) &&
      !!find("html")[0] &&
      /^[a-z]{2,3}(?:-[a-z0-9]+)*$/i.test(
        attribute(find("html")[0], "lang") ?? "",
      ),
    "Write the doctype, html, head, and body explicitly; set a valid language tag on html.",
  );
  check(
    "metadata",
    "Descriptive title and mobile viewport",
    inside(find("head")[0], "title").some((node) => meaningful(node, 4)) &&
      inside(find("head")[0], "meta").some(
        (node) =>
          attribute(node, "name")?.toLowerCase() === "viewport" &&
          /(?:^|[,;]\s*)width\s*=\s*device-width(?:[,;]|$)/i.test(
            attribute(node, "content") ?? "",
          ),
      ),
    "Put a descriptive title and width=device-width viewport metadata in head.",
  );
  check(
    "landmarks",
    "One main landmark and one meaningful page heading",
    find("main").length === 1 &&
      find("h1").length === 1 &&
      inside(main, "h1").some((node) => meaningful(node, 5)),
    "Place one meaningful h1 inside the page’s only main element.",
  );
  const ids = all
    .map((node) => attribute(node, "id"))
    .filter((id) => id !== undefined);
  check(
    "ids",
    "IDs are unique and nonempty",
    ids.every((id) => !!id?.trim()) && new Set(ids).size === ids.length,
    "Every id must identify exactly one element; duplicate ids break labels and links.",
  );
  check(
    "markup",
    "Markup parses without structural errors",
    parseErrors.length === 0,
    parseErrors.length
      ? `Parser findings: ${[...new Set(parseErrors)].slice(0, 5).join(", ")}.`
      : "The HTML parser found no structural errors.",
  );
  check(
    "static",
    "Static, inspectable HTML",
    !all.some(
      (node) =>
        FORBIDDEN_ELEMENTS.has(node.tagName) ||
        node.attrs.some(
          (attr) =>
            attr.name.startsWith("on") ||
            attr.name === "hidden" ||
            attr.name === "srcdoc" ||
            (attr.name === "aria-hidden" && attr.value === "true") ||
            attr.name === "http-equiv",
        ),
    ),
    "Use HTML and the CSS editor. Scripts, embedded pages, event handlers, and hidden grading content do not meet this brief.",
  );

  const labeled = (field: Element, form: Element) => {
    const id = attribute(field, "id");
    return (
      !!id &&
      byId(id).length === 1 &&
      inside(form, "label").some(
        (label) => attribute(label, "for") === id && meaningful(label),
      )
    );
  };
  if (project === "incident" || project === "launch") {
    const formId = project === "incident" ? "report" : "signup";
    const form = inside(main, "form").find(
      (node) => attribute(node, "id") === formId,
    );
    check(
      "form",
      "The form is inside the main content",
      !!form,
      `Create form id=${formId} inside main; controls must be inside that form.`,
    );
    check(
      "email",
      "Required email has a real connected label",
      !!form &&
        inside(form, "input").some(
          (node) =>
            attribute(node, "type")?.toLowerCase() === "email" &&
            attribute(node, "name") === "email" &&
            attribute(node, "required") !== undefined &&
            attribute(node, "disabled") === undefined &&
            labeled(node, form),
        ),
      "Use type=email, name=email, required, a unique id, and label for that id. A placeholder is not a label.",
    );
    check(
      "submit",
      "Named submit button belongs to the form",
      !!form &&
        inside(form, "button").some(
          (node) =>
            attribute(node, "type") === "submit" &&
            attribute(node, "disabled") === undefined &&
            meaningful(node),
        ),
      "Put an enabled button type=submit with meaningful text inside the form.",
    );
    if (project === "incident") {
      check(
        "severity",
        "Severity requires an intentional selection",
        !!form &&
          inside(form, "select").some(
            (node) =>
              attribute(node, "name") === "severity" &&
              attribute(node, "required") !== undefined &&
              attribute(node, "disabled") === undefined &&
              labeled(node, form) &&
              inside(node, "option").some(
                (option) => attribute(option, "value") === "",
              ) &&
              ["low", "medium", "high"].every((value) =>
                inside(node, "option").some(
                  (option) =>
                    attribute(option, "value") === value &&
                    attribute(option, "disabled") === undefined &&
                    meaningful(option),
                ),
              ),
          ),
        "Add a labeled required select name=severity with an empty placeholder and low, medium, high options.",
      );
      check(
        "description",
        "Description is labeled and requires useful detail",
        !!form &&
          inside(form, "textarea").some(
            (node) =>
              attribute(node, "name") === "description" &&
              attribute(node, "required") !== undefined &&
              attribute(node, "minlength") === "20" &&
              attribute(node, "disabled") === undefined &&
              labeled(node, form),
          ),
        "Use a required textarea name=description, minlength=20, and a connected label.",
      );
      check(
        "contact",
        "Contact choices form an accessible group",
        !!form &&
          inside(form, "fieldset").some(
            (group) =>
              direct(group, "legend").some((node) => meaningful(node)) &&
              ["email", "phone"].every((value) =>
                inside(group, "input").some(
                  (node) =>
                    attribute(node, "type") === "radio" &&
                    attribute(node, "name") === "channel" &&
                    attribute(node, "value") === value &&
                    attribute(node, "disabled") === undefined &&
                    labeled(node, form),
                ),
              ),
          ),
        "Group labeled radio inputs name=channel, values email and phone, inside a fieldset with a legend.",
      );
    } else {
      const validLink = (link: Element) => {
        const href = attribute(link, "href") ?? "";
        return (
          href.startsWith("#") &&
          byId(href.slice(1)).length === 1 &&
          meaningful(link)
        );
      };
      check(
        "navigation",
        "Navigation links reach real sections",
        find("header").some((header) =>
          inside(header, "nav").some(
            (nav) => inside(nav, "a").filter(validLink).length >= 2,
          ),
        ),
        "Place at least two named fragment links in header/nav and create their destinations.",
      );
      const features = inside(main, "section").find(
        (node) => attribute(node, "id") === "features",
      );
      check(
        "features",
        "Features have a heading and meaningful list",
        !!features &&
          inside(features, "h2").some((node) => meaningful(node)) &&
          [...inside(features, "ul"), ...inside(features, "ol")].some(
            (list) =>
              direct(list, "li").filter((node) => meaningful(node, 10))
                .length >= 3,
          ),
        "Create section id=features, an h2, and a list with at least three descriptive features.",
      );
      check(
        "action",
        "A named action leads to signup",
        inside(main, "a").some(
          (node) => attribute(node, "href") === "#signup" && validLink(node),
        ),
        "Add a meaningful link to #signup inside main.",
      );
      const faq = inside(main, "section").find(
        (node) => attribute(node, "id") === "faq",
      );
      check(
        "faq",
        "FAQ is operable without JavaScript",
        !!faq &&
          inside(faq, "h2").some((node) => meaningful(node)) &&
          inside(faq, "details").filter(
            (detail) =>
              direct(detail, "summary").some((node) => meaningful(node, 8)) &&
              inside(detail, "p").some((node) => meaningful(node, 20)),
          ).length >= 3,
        "Create section id=faq with h2 and three details elements, each with a summary question and paragraph answer.",
      );
      check(
        "footer",
        "Footer supplies closing context",
        find("footer").some((node) => meaningful(node, 10)),
        "Add a footer with useful text, such as the product name and contact context.",
      );
    }
  } else {
    const table = inside(main, "table")[0];
    check(
      "caption",
      "Service table has a descriptive caption",
      !!table && direct(table, "caption").some((node) => meaningful(node, 8)),
      "Give the table a caption that describes the service snapshot.",
    );
    const headings = inside(inside(table, "thead")[0], "th");
    check(
      "columns",
      "Column headers describe the data",
      headings.length === 3 &&
        headings.every(
          (node, index) =>
            attribute(node, "scope") === "col" &&
            content(node).toLowerCase() ===
              ["service", "status", "updated"][index],
        ),
      "Use thead and three th scope=col cells: Service, Status, Updated.",
    );
    const rows = inside(inside(table, "tbody")[0], "tr");
    const expected = [
      ["API Gateway", "Degraded"],
      ["Authentication", "Operational"],
      ["File Storage", "Maintenance"],
    ];
    check(
      "services",
      "Each service is paired with its correct text status",
      rows.length === 3 &&
        expected.every(([service, status]) =>
          rows.some(
            (row) =>
              direct(row, "th").some(
                (node) =>
                  attribute(node, "scope") === "row" &&
                  content(node) === service,
              ) &&
              direct(row, "td").length === 2 &&
              content(direct(row, "td")[0]) === status,
          ),
        ),
      "Create exactly three tbody rows using a service th scope=row and status/updated td cells. Use the states listed in the brief, not colored dots alone.",
    );
    const validTime = (node: Element) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(
        attribute(node, "datetime") ?? "",
      ) &&
      Number.isFinite(Date.parse(attribute(node, "datetime") ?? "")) &&
      meaningful(node);
    check(
      "row-time",
      "Every service update is machine-readable",
      rows.length === 3 &&
        rows.every((row) =>
          inside(direct(row, "td")[1], "time").some(validTime),
        ),
      "Put a time element with valid ISO datetime and readable text in each row’s Updated cell.",
    );
    const tableNodes = new Set(table ? elements(table) : []);
    check(
      "snapshot",
      "Page includes an overall snapshot time",
      inside(main, "time").some(
        (node) => !tableNodes.has(node) && validTime(node),
      ),
      "Add a readable time with valid datetime outside the table, inside main.",
    );
    const incident = inside(main, "section").find(
      (node) => attribute(node, "id") === "incident",
    );
    check(
      "incident",
      "Degraded service links to an explanation",
      !!incident &&
        inside(incident, "h2").some((node) => meaningful(node)) &&
        inside(incident, "p").some((node) => meaningful(node, 40)) &&
        rows.some(
          (row) =>
            direct(row, "th").some((node) => content(node) === "API Gateway") &&
            inside(row, "a").some(
              (node) =>
                attribute(node, "href") === "#incident" && meaningful(node),
            ),
        ),
      "Link the API Gateway row to section id=incident. Include an h2 and at least 40 characters explaining impact.",
    );
  }
  return checks;
}
