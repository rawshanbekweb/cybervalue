import { CANARY, SITE_ORIGIN, type Scenario } from "./scenarios";

// The learner's code runs in an iframe with sandbox="allow-scripts" and no
// allow-same-origin: an opaque origin with no access to this site's cookies,
// storage or DOM. This policy also blocks every network request, so payloads
// can neither load resources nor send data anywhere.
export const SANDBOX_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'none'",
  "media-src 'none'",
  "font-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

export const MAX_CODE_LENGTH = 12000;

// Inline script content ends at the first "</script" in any case, so the
// learner's code is neutralised for the HTML parser without changing its
// meaning ("<\/" is "</" inside JavaScript strings and regexes).
export const embedScript = (code: string) =>
  code.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

// JSON with "<" escaped cannot terminate the surrounding script element.
const embedJson = (value: unknown) =>
  JSON.stringify(value ?? null).replace(/</g, "\\u003c");

export const canaryName = (nonce: string) => `__cv_${nonce}`;

export function newNonce() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function armInput(input: unknown, nonce: string): unknown {
  return JSON.parse(
    JSON.stringify(input ?? null).replaceAll(CANARY, canaryName(nonce)),
  );
}

const STYLE = `body{margin:12px;font:14px/1.5 system-ui,sans-serif;color:#1d2a20;background:#f7f8f3}
.card{border:3px solid #9ba992;border-radius:10px;padding:12px 16px;background:#fff}
.comment{border-bottom:1px solid #d5dccd;padding:8px 0}
mark{background:#ffe48a}a{color:#21593a}`;

// One isolated document per case. The harness runs before the learner's code
// (to record errors and expose the detector) and after it (to call the
// function, simulate a visitor and report what the page contains).
export function buildDocument(
  code: string,
  scenario: Pick<Scenario, "call">,
  input: unknown,
  nonce: string,
) {
  const canary = canaryName(nonce);
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${SANDBOX_POLICY}">
<style>${STYLE}</style></head>
<body><div id="app"></div>
<script>
(() => {
  const state = { fired: [], errors: [] };
  window.SITE = ${JSON.stringify(SITE_ORIGIN)};
  window[${JSON.stringify(canary)}] = (tag) => { state.fired.push(String(tag)); };
  addEventListener("error", (event) => { state.errors.push(String(event.message || "error")); });
  window.__cvState = state;
})();
</script>
<script>
${embedScript(code.slice(0, MAX_CODE_LENGTH))}
</script>
<script>
(() => {
  const state = window.__cvState;
  const root = document.getElementById("app");
  const INPUT = ${embedJson(input)};
  let returned = null;
  let threw = null;
  try {
    returned = ${scenario.call};
  } catch (error) {
    threw = String((error && error.message) || error);
  }
  if (threw === null && state.errors.length) threw = state.errors[0];
  // A visitor moves the mouse and tabs through the page; delayed handlers fire.
  for (const element of root.querySelectorAll("*")) {
    for (const type of ["mouseover", "mouseenter", "pointerover", "focus"])
      element.dispatchEvent(new Event(type, { bubbles: type !== "mouseenter" && type !== "focus" }));
  }
  setTimeout(() => {
    const protocol = (href) => {
      try { return new URL(href || "", window.SITE).protocol; } catch { return "invalid:"; }
    };
    const report = {
      fired: state.fired.slice(0, 20),
      threw,
      timedOut: false,
      returned: typeof returned === "string" || returned === null ? returned : String(returned),
      text: (root.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 4000),
      html: root.innerHTML.slice(0, 4000),
      links: Array.from(root.querySelectorAll("a"), (a) => ({
        href: a.getAttribute("href"),
        protocol: protocol(a.getAttribute("href")),
        target: a.getAttribute("target") || "",
        rel: a.getAttribute("rel") || "",
        text: (a.textContent || "").trim(),
      })),
      marks: Array.from(root.querySelectorAll("mark"), (mark) => mark.textContent || ""),
      styles: [
        ...Array.from(root.querySelectorAll("[style]"), (el) => el.getAttribute("style") || ""),
        ...Array.from(document.querySelectorAll("#app style"), (el) => el.textContent || ""),
      ],
    };
    parent.postMessage({ channel: ${JSON.stringify(nonce)}, report }, "*");
  }, 120);
})();
</script>
</body></html>`;
}
