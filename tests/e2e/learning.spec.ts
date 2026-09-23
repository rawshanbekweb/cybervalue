import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("learning catalog filters lessons and opens the selected HTML exercise", async ({
  page,
}) => {
  await page.goto("/playground");
  await expect(page.locator(".learn-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Security", exact: true }).click();
  await expect(page.locator(".learn-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Web application security" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All tracks", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Search tracks and lessons" })
    .fill("Headings and paragraphs");
  await page
    .getByRole("link", { name: /02 · Headings and paragraphs/ })
    .click();
  await expect(page).toHaveURL(/html-basics#lesson\/2$/);
  await expect(
    page.getByRole("heading", { name: "Headings and paragraphs", exact: true }),
  ).toBeVisible();
});

test("completed HTML work can be resumed from the catalog", async ({
  page,
}) => {
  await page.goto("/playground/html-basics#lesson/1");
  await page
    .getByRole("button", { name: "Sample solution", exact: true })
    .click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".htb-celebrate")).toBeVisible();
  await page.evaluate(() => {
    window.location.hash = "lesson/2";
  });
  await expect(
    page.getByRole("heading", { name: "Headings and paragraphs", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".htb-celebrate")).toHaveCount(0);
  await page.goto("/playground");
  await expect(
    page.getByRole("progressbar", { name: "HTML foundations progress" }),
  ).toHaveAttribute("value", "1");
  await page
    .getByRole("link", { name: "Continue · Headings and paragraphs" })
    .click();
  await expect(page).toHaveURL(/html-basics#lesson\/2$/);
});

test("catalog resumes valid progress and tolerates damaged storage", async ({
  page,
}) => {
  await page.goto("/playground");
  await page.evaluate(() => {
    localStorage.setItem(
      "htmldars:progress:v1",
      JSON.stringify({ 1: true, 2: true, 3: false, 999: true }),
    );
    localStorage.setItem("sabaq:progress:v1", "not-json");
  });
  await page.reload();
  await expect(
    page.getByRole("progressbar", { name: "HTML foundations progress" }),
  ).toHaveAttribute("value", "2");
  await expect(
    page.getByRole("link", { name: /Continue · Formatting text/ }),
  ).toHaveAttribute("href", "/playground/html-basics#lesson/3");
  await expect(
    page.getByRole("progressbar", {
      name: "Web application security progress",
    }),
  ).toHaveAttribute("value", "0");
  await page.evaluate(() => {
    localStorage.setItem(
      "htmldars:progress:v1",
      JSON.stringify(
        Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, true])),
      ),
    );
    window.dispatchEvent(new StorageEvent("storage"));
  });
  await expect(
    page.getByRole("link", { name: "Review the track" }),
  ).toHaveAttribute("href", "/playground/html-basics#lesson/1");
});

test("empty search can be cleared and preview links follow the chosen topic", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search tracks and lessons" })
    .fill("zz-no-such-lesson");
  await expect(
    page.getByRole("heading", { name: "No matching tracks" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".learn-card")).toHaveCount(2);
  await page.getByRole("button", { name: /Defend/ }).click();
  await page.getByRole("button", { name: "Show insight" }).click();
  await expect(page.locator("#preview-result")).toContainText(
    "Check ownership on the server",
  );
  await expect(
    page.getByRole("link", { name: "Explore access control" }),
  ).toHaveAttribute("href", "/playground/web-security-lab#lesson/26");
  await page.getByRole("button", { name: /Investigate/ }).click();
  await expect(page.locator("#preview-result")).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Explore HTTP lessons" }),
  ).toHaveAttribute("href", "/playground/web-security-lab#lesson/7");
});

test("learning hub is accessible and fits mobile through desktop", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/playground");
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
