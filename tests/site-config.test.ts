import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closedSection,
  DEFAULT_CONFIG,
  parseSiteConfig,
  pick,
  safeHref,
} from "../src/lib/site-config";

test("a missing or damaged config falls back to the defaults", () => {
  assert.deepEqual(parseSiteConfig(undefined), DEFAULT_CONFIG);
  assert.deepEqual(parseSiteConfig("junk"), DEFAULT_CONFIG);
  const config = parseSiteConfig({
    announcement: {
      enabled: "yes",
      text: { uz: "  Salom  ", en: 5 },
      href: "javascript:alert(1)",
    },
    hero: { title: { uz: "x".repeat(500) } },
    sections: { network: false, junior: "off", nope: false },
    indexable: "true",
    email: "not an email",
  });
  assert.equal(config.announcement.enabled, false);
  assert.deepEqual(config.announcement.text, { uz: "Salom", en: "" });
  assert.equal(config.announcement.href, "");
  assert.equal(config.hero.title.uz.length, 80);
  assert.equal(config.sections.network, false);
  assert.equal(config.sections.junior, true);
  assert.equal("nope" in config.sections, false);
  assert.equal(config.indexable, null);
  assert.equal(config.email, "");
  assert.equal(
    parseSiteConfig({ email: "me@example.uz" }).email,
    "me@example.uz",
  );
});

test("links must be internal paths or https", () => {
  assert.equal(safeHref("/playground/junior#x"), "/playground/junior#x");
  assert.equal(safeHref("//evil.example"), "");
  assert.equal(safeHref("http://example.com"), "");
  assert.equal(safeHref("https://t.me/cybervalue"), "https://t.me/cybervalue");
  assert.equal(pick({ uz: "", en: "Hi" }, "uz"), "Hi");
  assert.equal(pick({ uz: "Salom", en: "Hi" }, "uz"), "Salom");
});

test("switched-off sections close their own pages only", () => {
  const off = (patch: object) =>
    parseSiteConfig({ sections: { ...DEFAULT_CONFIG.sections, ...patch } });
  assert.equal(
    closedSection(DEFAULT_CONFIG, "/playground/network-basics"),
    null,
  );
  assert.equal(
    closedSection(off({ network: false }), "/playground/network-basics"),
    "network",
  );
  assert.equal(
    closedSection(off({ network: false }), "/playground/linux-basics"),
    null,
  );
  // Closing the academy closes its labs, but not Junior.
  const academy = off({ academy: false });
  assert.equal(closedSection(academy, "/playground"), "academy");
  assert.equal(closedSection(academy, "/playground/ctf"), "academy");
  assert.equal(closedSection(academy, "/playground/junior/ciphers"), null);
  assert.equal(
    closedSection(off({ junior: false }), "/playground/junior/ciphers"),
    "junior",
  );
  assert.equal(
    closedSection(off({ portfolio: false }), "/research/some-post"),
    "portfolio",
  );
  assert.equal(closedSection(off({ portfolio: false }), "/about"), null);
  assert.equal(
    closedSection(off({ studentArea: false }), "/student/login"),
    "studentArea",
  );
});
