// "Build & Defend": the learner writes rendering code, then an attacker bot
// feeds it real payloads inside an isolated sandbox. Everything here is pure
// data and checks over a run report, so it can be tested without a browser.

export const SITE_ORIGIN = "https://cybervalue.example";
// Replaced per run with a random function name, so learner code cannot
// predict or pre-empt the detector.
export const CANARY = "__CANARY__";

export type ScenarioId = "comments" | "profile" | "search" | "redirect";

export type LinkReport = {
  href: string | null;
  protocol: string;
  target: string;
  rel: string;
  text: string;
};

export type RunReport = {
  // Payload markers that actually executed.
  fired: string[];
  // Exception thrown by the learner's function, if any.
  threw: string | null;
  timedOut: boolean;
  returned: unknown;
  text: string;
  html: string;
  links: LinkReport[];
  marks: string[];
  styles: string[];
};

export type CaseKind = "attack" | "function";

export type Case = {
  id: string;
  kind: CaseKind;
  label: string;
  // Shown when the case fails: what went wrong and how to think about it.
  failure: string;
  input: unknown;
  check: (report: RunReport) => boolean;
};

export type Scenario = {
  id: ScenarioId;
  number: string;
  title: string;
  client: string;
  level: string;
  brief: string;
  // The function the learner must keep, shown as a contract.
  signature: string;
  call: string;
  sample: unknown;
  starter: string;
  cases: Case[];
  hints: string[];
  debrief: string;
  lesson: string;
};

const executed = (report: RunReport) => report.fired.length > 0;
const healthy = (report: RunReport) => !report.timedOut && !report.threw;
// An attack only counts as defended if nothing ran and the code still works.
const blocked = (report: RunReport) => healthy(report) && !executed(report);
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"];
const safeLinks = (report: RunReport) =>
  report.links.every((link) => !DANGEROUS_PROTOCOLS.includes(link.protocol));
const shows = (report: RunReport, ...parts: string[]) =>
  parts.every((part) => report.text.includes(part));

const comments = (...items: [string, string][]) =>
  items.map(([author, text]) => ({ author, text }));

const commentWall: Scenario = {
  id: "comments",
  number: "01",
  title: "The comment wall",
  client: "School news board",
  level: "Stored XSS",
  brief:
    "Pupils leave comments under school news. The page works, but it builds HTML by gluing strings together. An attacker bot is about to post comments of its own. Keep every comment readable, and make sure no comment can ever run code.",
  signature: "renderComments(root, comments)",
  call: "renderComments(root, INPUT)",
  sample: comments(
    ["Dilnoza", "Great lesson, thank you!"],
    ["Bekzod", "Can we have a lesson about <table> tags?"],
  ),
  starter: `// comments: [{ author: "Dilnoza", text: "Great lesson!" }, ...]
function renderComments(root, comments) {
  root.innerHTML = comments
    .map(
      (comment) =>
        \`<article class="comment"><b>\${comment.author}</b><p>\${comment.text}</p></article>\`,
    )
    .join("");
}
`,
  cases: [
    {
      id: "show-comments",
      kind: "function",
      label: "Ordinary comments are shown",
      failure:
        "Each comment’s author and text must appear on the page. Removing the comments is not a defense.",
      input: comments(
        ["Dilnoza", "Great lesson, thank you!"],
        ["Bekzod", "See you tomorrow."],
      ),
      check: (r) =>
        healthy(r) && shows(r, "Dilnoza", "Great lesson, thank you!", "Bekzod"),
    },
    {
      id: "literal-tags",
      kind: "function",
      label: "Tags in a comment are shown as text",
      failure:
        "A pupil asking about <table> must see “<table>” on the page. If the tag disappears, the browser parsed text as HTML.",
      input: comments(["Bekzod", "What does <table> do? And <b>bold</b>?"]),
      check: (r) =>
        healthy(r) && shows(r, "What does <table> do? And <b>bold</b>?"),
    },
    {
      id: "img-onerror",
      kind: "attack",
      label: "Image with an onerror handler",
      failure:
        "The comment created a real <img> element whose error handler ran. Any text you insert as HTML can become an element with event handlers.",
      input: comments([
        "Guest",
        `Nice! <img src="x" onerror="${CANARY}('img')">`,
      ]),
      check: blocked,
    },
    {
      id: "svg-author",
      kind: "attack",
      label: "SVG payload in the author name",
      failure:
        "The author field is user input too. An <svg onload> element ran as soon as it was inserted.",
      input: comments([`<svg onload="${CANARY}('svg')"></svg>Admin`, "Hi"]),
      check: blocked,
    },
    {
      id: "hover-handler",
      kind: "attack",
      label: "Handler that waits for the mouse",
      failure:
        "The payload ran when the bot moved the mouse over the comment. Payloads do not have to run immediately to be dangerous.",
      input: comments([
        "Guest",
        `<b onmouseover="${CANARY}('hover')">Move your mouse here</b>`,
      ]),
      check: blocked,
    },
    {
      id: "js-link",
      kind: "attack",
      label: "Link with a javascript: address",
      failure:
        "The comment produced a link whose address runs code when clicked. Only text should come out of a comment.",
      input: comments([
        "Guest",
        `<a href="javascript:${CANARY}('link')">Read the rules</a>`,
      ]),
      check: (r) => blocked(r) && safeLinks(r),
    },
  ],
  hints: [
    "innerHTML parses its value as HTML. textContent treats it as plain text, whatever characters it contains.",
    "Build the elements yourself with document.createElement, put user values in with textContent, then add them to root.",
    "Clear old content with root.replaceChildren(...newElements) instead of assigning innerHTML.",
  ],
  debrief:
    "Stored XSS happens when saved input is later rendered as code. The fix is not to filter “bad” words but to choose a sink that treats data as text: textContent and createElement. When you truly need user-supplied HTML, use a proven sanitizer and a Content Security Policy as a second layer.",
  lesson: "/playground/web-security-lab#lesson/25",
};

const profile = (overrides: Record<string, string> = {}) => ({
  name: "Madina",
  website: "https://madina.example",
  bio: "Frontend developer and mentor",
  color: "#087e78",
  ...overrides,
});

const profileCard: Scenario = {
  id: "profile",
  number: "02",
  title: "The profile card",
  client: "Mentor directory",
  level: "Attributes & URLs",
  brief:
    "Mentors fill in a name, a website, a short bio and a border color. Values end up inside attributes, links and styles, not just text. The bot will try to break out of attributes, smuggle code into the link and hijack the style.",
  signature: "renderProfile(root, profile)",
  call: "renderProfile(root, INPUT)",
  sample: profile(),
  starter: `// profile: { name, website, bio, color }
function renderProfile(root, profile) {
  root.innerHTML = \`
    <div class="card" style="border-color: \${profile.color}">
      <h2 title="\${profile.name}">\${profile.name}</h2>
      <p>\${profile.bio}</p>
      <a href="\${profile.website}" target="_blank">Website</a>
    </div>\`;
}
`,
  cases: [
    {
      id: "show-profile",
      kind: "function",
      label: "Name, bio and website link work",
      failure:
        "The card must show the name and bio and keep a working link to an https website that opens in a new tab.",
      input: profile(),
      check: (r) =>
        healthy(r) &&
        shows(r, "Madina", "Frontend developer and mentor") &&
        r.links.some(
          (link) =>
            link.protocol === "https:" &&
            link.href !== null &&
            new URL(link.href, SITE_ORIGIN).href ===
              new URL("https://madina.example").href &&
            link.target === "_blank",
        ),
    },
    {
      id: "valid-color",
      kind: "function",
      label: "A valid hex color is applied",
      failure:
        "A real color such as #087e78 must still reach the card’s border. Validate the value; don’t drop the feature.",
      input: profile(),
      check: (r) =>
        healthy(r) &&
        r.styles.some((style) =>
          /#087e78|rgb\(\s*8,\s*126,\s*120\s*\)/i.test(style),
        ),
    },
    {
      id: "attribute-breakout",
      kind: "attack",
      label: "Breaking out of the title attribute",
      failure:
        "A quote in the name closed the title attribute and added an event handler. Escaping for text is not enough inside attributes; set attributes through the DOM instead.",
      input: profile({
        name: `Madina" onmouseover="${CANARY}('attr')" x="`,
      }),
      check: blocked,
    },
    {
      id: "javascript-url",
      kind: "attack",
      label: "javascript: website with mixed case and spaces",
      failure:
        'The website link runs code when clicked. Browsers ignore case and leading spaces, so a check like startsWith("javascript:") is easy to bypass. Allow only http: and https: after parsing with new URL().',
      input: profile({ website: ` JaVaScRiPt:${CANARY}('js-url')` }),
      check: (r) => blocked(r) && safeLinks(r),
    },
    {
      id: "data-url",
      kind: "attack",
      label: "data: website that carries a whole page",
      failure:
        "A data: URL can contain a complete HTML page with scripts. Use an allow-list of protocols, not a block-list.",
      input: profile({
        website: "data:text/html,<script>alert(document.domain)</script>",
      }),
      check: (r) => blocked(r) && safeLinks(r),
    },
    {
      id: "tabnabbing",
      kind: "attack",
      label: "New tab can control this page",
      failure:
        'A link with target=_blank and no rel="noopener" lets the opened site navigate your page through window.opener (reverse tabnabbing).',
      input: profile(),
      check: (r) =>
        healthy(r) &&
        r.links
          .filter((link) => link.target === "_blank")
          .every((link) => /\bnoopener\b|\bnoreferrer\b/.test(link.rel)),
    },
    {
      id: "css-injection",
      kind: "attack",
      label: "Style injection through the color",
      failure:
        "The color value added extra CSS that loads an outside image, which can track visitors or reshape the page. Accept only a strict pattern such as /^#[0-9a-f]{6}$/i.",
      input: profile({
        color: "red; background-image: url(https://evil.example/track.png)",
      }),
      check: (r) =>
        healthy(r) &&
        r.styles.every((style) => !/url\s*\(|@import|expression/i.test(style)),
    },
    {
      id: "bio-payload",
      kind: "attack",
      label: "Image payload in the bio",
      failure:
        "The bio created a real element whose handler ran. Every field that reaches the page needs the same care.",
      input: profile({ bio: `<img src="x" onerror="${CANARY}('bio')">` }),
      check: blocked,
    },
  ],
  hints: [
    "Set attributes with element.title = value or setAttribute; the DOM handles quotes for you.",
    'Parse the website with new URL(value) inside try/catch and only create the link when url.protocol is "https:" or "http:".',
    'For new tabs set link.rel = "noopener noreferrer". Apply the color only if /^#[0-9a-f]{6}$/i.test(color).',
  ],
  debrief:
    "Context decides the defense: text needs textContent, attributes need DOM properties, URLs need parsing plus a protocol allow-list, and styles need strict validation. One generic “escape” function cannot protect every context.",
  lesson: "/playground/web-security-lab#lesson/25",
};

const results = (...items: [string, string][]) =>
  items.map(([title, url]) => ({ title, url }));

const searchPage: Scenario = {
  id: "search",
  number: "03",
  title: "The search results",
  client: "Lesson library",
  level: "Reflected XSS",
  brief:
    "The search page repeats the visitor’s query and highlights it inside each result title. The query arrives straight from the URL, so anyone can send a victim a crafted search link. Keep highlighting working and make both the query and the titles harmless.",
  signature: "renderResults(root, query, results)",
  call: "renderResults(root, INPUT.query, INPUT.results)",
  sample: {
    query: "security",
    results: results(
      ["Web security basics", "/lessons/web-security"],
      ["Security headers in practice", "/lessons/headers"],
    ),
  },
  starter: `// query: "security", results: [{ title, url }, ...]
function renderResults(root, query, results) {
  const highlight = (text) => text.replaceAll(query, \`<mark>\${query}</mark>\`);
  root.innerHTML =
    \`<p>Results for “\${query}”: \${results.length}</p>\` +
    \`<ul>\${results
      .map((r) => \`<li><a href="\${r.url}">\${highlight(r.title)}</a></li>\`)
      .join("")}</ul>\`;
}
`,
  cases: [
    {
      id: "highlight",
      kind: "function",
      label: "Matches are highlighted with <mark>",
      failure:
        "Each match of the query inside a title must be wrapped in a real <mark> element, and the full title must still read correctly.",
      input: {
        query: "security",
        results: results(["Web security basics", "/lessons/web-security"]),
      },
      check: (r) =>
        healthy(r) &&
        shows(r, "Web security basics") &&
        r.marks.length === 1 &&
        r.marks[0] === "security",
    },
    {
      id: "literal-query",
      kind: "function",
      label: "The query is repeated exactly",
      failure:
        "Someone searching for <b> must see “<b>” in the summary. If it vanished, the query was parsed as HTML.",
      input: { query: "<b>", results: [] },
      check: (r) => healthy(r) && shows(r, "<b>"),
    },
    {
      id: "entity-trap",
      kind: "function",
      label: "Highlighting doesn’t corrupt escaped text",
      failure:
        "Searching for “lt” changed the title “a < b”. Escaping first and then replacing in the escaped string breaks entities such as &lt;. Highlight with DOM nodes on the original text.",
      input: { query: "lt", results: results(["a < b", "/lessons/compare"]) },
      check: (r) => healthy(r) && shows(r, "a < b") && r.marks.length === 0,
    },
    {
      id: "reflected-query",
      kind: "attack",
      label: "Payload in the search query",
      failure:
        "The query from the URL became a real element and ran. This is reflected XSS: one crafted link is enough to attack whoever opens it.",
      input: {
        query: `<img src="x" onerror="${CANARY}('query')">`,
        results: [],
      },
      check: blocked,
    },
    {
      id: "stored-title",
      kind: "attack",
      label: "Payload in a result title",
      failure:
        "A title from the database ran as code. Data from your own server is still untrusted if a user wrote it.",
      input: {
        query: "lesson",
        results: results([
          `<svg onload="${CANARY}('title')"></svg>lesson`,
          "/lessons/x",
        ]),
      },
      check: blocked,
    },
    {
      id: "highlight-injection",
      kind: "attack",
      label: "Payload that survives highlighting",
      failure:
        "Inserting the query into the markup as the highlight let it run. Highlighted text needs the same text-only handling.",
      input: {
        query: `<img src=x onerror=${CANARY}('mark')>`,
        results: results([
          `Search for <img src=x onerror=${CANARY}('mark')>`,
          "/lessons/x",
        ]),
      },
      check: blocked,
    },
    {
      id: "result-url",
      kind: "attack",
      label: "Result with a javascript: link",
      failure:
        "A result link would run code when clicked. Keep only links whose parsed protocol is https: (relative links resolve to https: here).",
      input: {
        query: "lesson",
        results: results(["lesson", `javascript:${CANARY}('url')`]),
      },
      check: (r) => blocked(r) && safeLinks(r),
    },
  ],
  hints: [
    "Write the summary with textContent: summary.textContent = `Results for “${query}”: ${results.length}`.",
    "To highlight, find each match with indexOf on the original title, append the text before it, then a <mark> whose textContent is the match.",
    "Check each result URL with new URL(r.url, SITE) (SITE is this site’s address) and keep the link only when the protocol is https:.",
  ],
  debrief:
    "Reflected XSS turns a link into a weapon. Treat the query as text everywhere it appears, including inside highlighting. Building the highlighted title from DOM nodes keeps both the feature and the safety.",
  lesson: "/playground/web-security-lab#lesson/25",
};

const sameSite = (report: RunReport) => {
  if (!healthy(report) || typeof report.returned !== "string") return false;
  try {
    return new URL(report.returned, SITE_ORIGIN).origin === SITE_ORIGIN;
  } catch {
    return false;
  }
};
const lands = (report: RunReport, path: string) =>
  sameSite(report) &&
  (() => {
    const url = new URL(report.returned as string, SITE_ORIGIN);
    return `${url.pathname}${url.search}${url.hash}` === path;
  })();

const redirect: Scenario = {
  id: "redirect",
  number: "04",
  title: "The return address",
  client: "Sign-in page",
  level: "Open redirect",
  brief:
    "After signing in, the site sends people back to the page in ?next=. Phishers love this: a real link to your site that ends on theirs. Return a safe path on this site for every input, and “/” when the input is unusable.",
  signature: "safeRedirect(next)",
  call: "safeRedirect(INPUT)",
  sample: "/dashboard",
  starter: `// The site lives at https://cybervalue.example
// Return the path to send the visitor to after sign-in.
function safeRedirect(next) {
  if (next && next.startsWith("/")) return next;
  return "/";
}
`,
  cases: [
    {
      id: "keep-path",
      kind: "function",
      label: "Normal paths are kept",
      failure:
        "“/dashboard” must lead to /dashboard. Always returning “/” is safe, but it breaks the feature.",
      input: "/dashboard",
      check: (r) => lands(r, "/dashboard"),
    },
    {
      id: "keep-query",
      kind: "function",
      label: "Query and fragment are kept",
      failure:
        "“/lessons?id=3#top” must keep its query and fragment so the visitor lands in the right place.",
      input: "/lessons?id=3#top",
      check: (r) => lands(r, "/lessons?id=3#top"),
    },
    {
      id: "empty",
      kind: "function",
      label: "Missing input falls back to “/”",
      failure: "An empty or missing value must return “/” without an error.",
      input: "",
      check: (r) => lands(r, "/"),
    },
    {
      id: "protocol-relative",
      kind: "attack",
      label: "Protocol-relative address //evil",
      failure:
        "“//evil.example” starts with a slash but means “another site over the same protocol”. Resolve the value with new URL(next, origin) and compare origins.",
      input: "//evil.example/login",
      check: sameSite,
    },
    {
      id: "backslash",
      kind: "attack",
      label: "Backslash trick /\\evil",
      failure:
        "Browsers treat “\\” like “/” in web addresses, so “/\\evil.example” leaves your site. String checks miss this; URL parsing does not.",
      input: "/\\evil.example",
      check: sameSite,
    },
    {
      id: "control-characters",
      kind: "attack",
      label: "Hidden tab inside the slashes",
      failure:
        "The URL parser removes tabs and newlines, so “/\\t/evil.example” becomes “//evil.example”. Always judge the parsed URL, never the raw string.",
      input: "/\t/evil.example",
      check: sameSite,
    },
    {
      id: "absolute",
      kind: "attack",
      label: "Absolute address to another site",
      failure: "“https://evil.example” must never be returned.",
      input: "https://evil.example/login",
      check: sameSite,
    },
  ],
  hints: [
    'Don’t inspect the string. Parse it: const url = new URL(next, "https://cybervalue.example").',
    'Accept the result only if url.origin === "https://cybervalue.example"; otherwise return "/".',
    "Return url.pathname + url.search + url.hash, and wrap parsing in try/catch for unusable input.",
  ],
  debrief:
    "Open redirects borrow your site’s trust for phishing. Parsing with the same URL rules the browser uses, then comparing origins, defeats tricks that string checks miss: protocol-relative URLs, backslashes and hidden control characters.",
  lesson: "/playground/web-security-lab#lesson/27",
};

export const SCENARIOS: Scenario[] = [
  commentWall,
  profileCard,
  searchPage,
  redirect,
];

export type CaseResult = {
  id: string;
  kind: CaseKind;
  passed: boolean;
  report: RunReport;
};

export function summarize(scenario: Scenario, results: CaseResult[]) {
  const count = (kind: CaseKind) => {
    const cases = scenario.cases.filter((item) => item.kind === kind);
    return {
      total: cases.length,
      passed: cases.filter((item) =>
        results.some((result) => result.id === item.id && result.passed),
      ).length,
    };
  };
  const attacks = count("attack");
  const features = count("function");
  return {
    attacks,
    features,
    defended:
      attacks.passed === attacks.total && features.passed === features.total,
  };
}

// Payloads are shown to the learner after a run with a readable marker
// instead of the random detector name.
export const displayInput = (input: unknown) =>
  JSON.stringify(input, null, 2).replaceAll(CANARY, "pwned");
