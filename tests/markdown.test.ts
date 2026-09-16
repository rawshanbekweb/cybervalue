import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "../src/components/markdown";
test("untrusted Markdown cannot execute HTML, link schemes, or remote image tracking", () => {
  const html = renderToStaticMarkup(
    // A required string child is passed as a prop for React's component overload.
    // eslint-disable-next-line react/no-children-prop -- children required as a prop here
    createElement(Markdown, {
      children:
        "<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[attack](javascript:alert%281%29)\n\n![tracker](https://evil.test/track.png)\n\n# Heading\n\n**Safe text**",
    }),
  );
  assert.ok(!html.includes("<script"));
  assert.ok(!html.includes("onerror="));
  assert.ok(!html.includes("javascript:"));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("<h2>Heading</h2>"));
  assert.ok(html.includes("<strong>Safe text</strong>"));
});
