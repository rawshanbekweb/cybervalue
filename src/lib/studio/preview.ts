import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";
import { FORBIDDEN_ELEMENTS } from "./checks";

export const PREVIEW_CSP =
  "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; form-action 'none'; base-uri 'none'";

// Parse and reserialize before putting learner HTML inside an opaque sandbox.
// The editor source is retained separately; only the preview/export is cleaned.
export function buildPreview(html: string, css: string): string {
  const doc = parse(html.slice(0, 30000));
  const clean = (node: DefaultTreeAdapterMap["node"]) => {
    if (!("childNodes" in node)) return;
    node.childNodes = node.childNodes.filter(
      (child) =>
        !("tagName" in child) ||
        (!FORBIDDEN_ELEMENTS.has(child.tagName) &&
          !["meta", "style"].includes(child.tagName)),
    );
    for (const child of node.childNodes) {
      if ("tagName" in child) {
        child.attrs = child.attrs.filter(
          (attr) =>
            !attr.name.startsWith("on") &&
            ![
              "srcdoc",
              "action",
              "formaction",
              "formtarget",
              "target",
              "ping",
              "srcset",
            ].includes(attr.name) &&
            (attr.name !== "href" || /^#[a-zA-Z][\w:-]*$/.test(attr.value)) &&
            (attr.name !== "src" ||
              /^data:image\/(?:png|jpeg|gif|webp);base64,[a-zA-Z0-9+/=]+$/i.test(
                attr.value,
              )),
        );
      }
      clean(child);
    }
  };
  clean(doc);
  const safeCss = css.slice(0, 20000).replace(/<\/style/gi, "<\\/style");
  return serialize(doc).replace(
    "<head>",
    `<head><meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${safeCss}</style>`,
  );
}
