import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/about",
  "/work",
  "/research",
  "/labs",
  "/ctf",
  "/resources",
  "/activity",
  "/search",
];
test("every public page has distinct metadata, one h1, canonical, and no broken internal links", async ({
  page,
  request,
}) => {
  const titles = new Set<string>();
  const links = new Set<string>();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const title = await page.title();
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!)))
      links.add(href.split("#")[0]);
    for (const json of await page
      .locator('script[type="application/ld+json"]')
      .allTextContents())
      expect(() => JSON.parse(json)).not.toThrow();
  }
  for (const link of links)
    expect((await request.get(link)).status(), link).toBe(200);
});
test("robots, sitemap, headers, OG, redirects, missing pages and downloads", async ({
  request,
}) => {
  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("/admin");
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  expect((await request.get("/work/", { maxRedirects: 0 })).status()).toBe(308);
  for (const path of [
    "/missing-page",
    "/work/not-published",
    "/downloads/missing",
  ])
    expect((await request.get(path)).status(), path).toBe(404);
});
test("filters canonicalize to archive and are noindex", async ({ page }) => {
  await page.goto("/labs?q=authorization&difficulty=BEGINNER");
  await expect(page.getByRole("searchbox")).toHaveValue("authorization");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/labs$/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await page.getByRole("link", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await page.goto("/labs?page=-1");
  await expect(page.locator(".filter-error")).toContainText("invalid");
});
test("responsive layouts and keyboard navigation", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width <= 850) {
      const menu = page.getByRole("button", { name: "Open navigation" });
      await menu.click();
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Labs", exact: true })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Labs.");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
test("home, archives and about pass automated accessibility checks", async ({
  page,
}) => {
  for (const route of ["/", "/about", "/labs", "/search"]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      `${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});
