import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the Intermediate roadmap lists every domain and its modules", async ({
  page,
}) => {
  await page.goto("/akademiya");
  await page.getByRole("link", { name: /roadmap|xaritasi/i }).click();
  await expect(page).toHaveURL(/\/akademiya\/intermediate$/);
  await expect(page.locator(".im-domain")).toHaveCount(12);
  const web = page.locator("#webappsec");
  await web.locator("summary").click();
  await expect(web.locator(".im-modules li")).toHaveCount(5);
  // A career path links to its domains on the page.
  await page.locator(".im-path a").first().click();
  await expect(page).toHaveURL(/#webappsec$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
});
