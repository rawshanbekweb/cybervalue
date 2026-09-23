import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "parse5";
import { checkProject, elements, attribute } from "../src/lib/studio/checks";
import { buildPreview, PREVIEW_CSP } from "../src/lib/studio/preview";
import { restoreDraft } from "../src/lib/studio/draft";
import { STUDIO_PROJECTS } from "../src/lib/studio/projects";
import { studioSolutions } from "./fixtures/studio";

test("every studio brief accepts a complete solution and rejects its incomplete starter", () => {
  for (const project of STUDIO_PROJECTS) {
    const results = checkProject(project.id, studioSolutions[project.id]);
    assert.deepEqual(
      results.filter((result) => !result.passed),
      [],
    );
    assert.ok(
      checkProject(project.id, project.html).some((result) => !result.passed),
    );
  }
});

test("structural checks require connected labels, real destinations, correct service data, and visible content", () => {
  const passes = (
    id: keyof typeof studioSolutions,
    html: string,
    check: string,
  ) => checkProject(id, html).find((item) => item.id === check)?.passed;
  assert.equal(
    passes(
      "incident",
      studioSolutions.incident.replace('for="email"', 'for="missing"'),
      "email",
    ),
    false,
  );
  assert.equal(
    passes(
      "incident",
      studioSolutions.incident.replace(
        'type="email" required',
        'type="email" required disabled',
      ),
      "email",
    ),
    false,
  );
  assert.equal(
    passes(
      "incident",
      studioSolutions.incident.replace('name="description"', 'name="other"'),
      "description",
    ),
    false,
  );
  assert.equal(
    passes(
      "incident",
      studioSolutions.incident.replace("<h1>", "<h1 hidden>"),
      "static",
    ),
    false,
  );
  assert.equal(
    passes(
      "launch",
      studioSolutions.launch.replace('id="features"', 'id="missing"'),
      "navigation",
    ),
    false,
  );
  assert.equal(
    passes(
      "status",
      studioSolutions.status.replace("Degraded", "Operational"),
      "services",
    ),
    false,
  );
  assert.equal(
    passes(
      "status",
      studioSolutions.status.replaceAll("2026-09-23T09:30:00Z", "not-a-date"),
      "row-time",
    ),
    false,
  );
  assert.equal(
    passes(
      "status",
      studioSolutions.status.replace('href="#incident"', 'href="#missing"'),
      "incident",
    ),
    false,
  );
});

test("preview removes executable markup and remote navigation while retaining editable source separately", () => {
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=https://example.com"><style>body{color:red}</style></head><body><script>alert(1)</script><iframe srcdoc="bad"></iframe><svg onload="alert(1)"></svg><form action="https://example.com"><button formaction="https://example.com" onclick="alert(1)">Submit</button></form><a href="https://example.com" ping="https://example.com">Remote</a><a href="#local">Local</a><h1 id="local">Keep this heading</h1><img src="https://example.com/image" srcset="https://example.com/other 2x"></body></html>`;
  const preview = buildPreview(
    html,
    `body {color: green} </style><script>alert(2)</script><style>`,
  );
  const all = elements(parse(preview));
  assert.equal(
    all.some((node) => ["script", "iframe", "svg"].includes(node.tagName)),
    false,
  );
  assert.equal(
    all.some((node) =>
      node.attrs.some((attr) =>
        [
          "onclick",
          "srcdoc",
          "action",
          "formaction",
          "ping",
          "srcset",
          "src",
        ].includes(attr.name),
      ),
    ),
    false,
  );
  assert.deepEqual(
    all
      .filter((node) => node.tagName === "a")
      .map((node) => attribute(node, "href")),
    [undefined, "#local"],
  );
  assert.equal(
    all
      .find(
        (node) => attribute(node, "http-equiv") === "Content-Security-Policy",
      )
      ?.attrs.find((attr) => attr.name === "content")?.value,
    PREVIEW_CSP,
  );
  assert.equal(all.filter((node) => node.tagName === "style").length, 1);
  assert.ok(html.includes("onclick"));
});

test("draft recovery rejects malformed fields, bounds content, and preserves intentional empty editors", () => {
  const project = STUDIO_PROJECTS[0];
  for (const value of [null, [], "bad", 42])
    assert.equal(restoreDraft(value, project).html, project.html);
  assert.deepEqual(
    restoreDraft({ html: "", css: "", notes: "My design notes" }, project),
    { html: "", css: "", notes: "My design notes" },
  );
  assert.deepEqual(
    restoreDraft({ html: "x".repeat(30001), css: 3, notes: {} }, project),
    { html: project.html, css: project.css, notes: "" },
  );
});
