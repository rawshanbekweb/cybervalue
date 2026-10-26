import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the lab links to its video lesson, which plays and seeks by chapter", async ({
  page,
}) => {
  await page.goto("/akademiya/bash");
  await page.getByRole("link", { name: "Videodarsni ko‘rish" }).click();
  await expect(page).toHaveURL(/\/akademiya\/bash\/video$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bash asoslari",
  );
  const time = page.locator(".vl-time");
  await expect(time).toHaveText(/^0:00 \//);
  await page.getByRole("button", { name: "Ijro" }).first().click();
  await expect(time).not.toHaveText(/^0:00 \//, { timeout: 5000 });
  await page.getByRole("button", { name: "Pauza" }).click();

  const chapters = page.getByRole("navigation", { name: "Boblar" });
  await chapters.getByRole("button", { name: /for sikli/ }).click();
  await expect(page.locator(".vl-chapter-label")).toContainText("for sikli");
  await expect(
    chapters.getByRole("button", { name: /for sikli/ }),
  ).toHaveAttribute("aria-current", "step");
  await page.getByText("Darsning to‘liq matni").click();
  await expect(page.locator(".vl-transcript")).toContainText("while sikli");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .include(".vl-page")
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
});
