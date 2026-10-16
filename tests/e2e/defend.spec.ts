import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { defendSolutions } from "../fixtures/defend";

const locale = (value: "uz" | "en") => ({
  cookies: [
    {
      name: "cybervalue-locale",
      value,
      domain: "localhost",
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
});

const notice = (page: Page) => page.locator(".defend-notice");

async function attack(page: Page, code?: string) {
  if (code !== undefined)
    await page.getByLabel("JavaScript code", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Launch the attack" }).click();
  await expect(notice(page)).toBeVisible();
}

test.describe("in English", () => {
  test.use({ storageState: locale("en") });

  test("the starter code is exploited for real and the attack shows the evidence", async ({
    page,
  }) => {
    await page.goto("/akademiya");
    await page.getByRole("link", { name: "Open Build & Defend" }).click();
    await expect(page).toHaveURL(/\/akademiya\/defend$/);
    await attack(page);
    await expect(notice(page)).toContainText(/\d of 4 attacks blocked/);
    const exploited = page
      .locator(".defend-line.fail")
      .filter({ hasText: "VULNERABLE" })
      .first();
    await expect(exploited).toContainText("ATTACK");
    await expect(exploited.locator(".defend-evidence")).toContainText(
      "the payload executed",
    );
    // The random detector name stays hidden behind a readable marker.
    await expect(exploited.locator(".defend-io")).toContainText("pwned(");
    await expect(exploited.locator(".defend-io")).not.toContainText("__cv_");
  });

  test("every scenario can be defended, and progress survives a reload", async ({
    page,
  }) => {
    await page.goto("/akademiya/defend");
    for (const [id, code] of Object.entries(defendSolutions)) {
      await page.goto(`/akademiya/defend#scenario/${id}`);
      await attack(page, code);
      await expect(notice(page)).toHaveText(
        "Every attack failed and every feature works. Scenario defended.",
      );
      await expect(page.getByRole("region", { name: "Debrief" })).toContainText(
        "The bot is beaten.",
      );
    }
    await page.reload();
    const nav = page.getByRole("navigation", { name: "Choose a scenario" });
    await expect(nav.getByText("Defended", { exact: true })).toHaveCount(4);
    await expect(
      page.getByLabel("JavaScript code", { exact: true }),
    ).toHaveValue(defendSolutions.redirect);

    const download = page.waitForEvent("download");
    await attack(page);
    await page.getByRole("button", { name: "Export defense report" }).click();
    expect((await download).suggestedFilename()).toBe(
      "cybervalue-defend-redirect.md",
    );
  });

  test("editing after an attack marks the result as stale", async ({
    page,
  }) => {
    await page.goto("/akademiya/defend#scenario/redirect");
    await attack(page, defendSolutions.redirect);
    await page
      .getByLabel("JavaScript code", { exact: true })
      .fill(`${defendSolutions.redirect}\n// changed`);
    await expect(
      page.getByText("Your code changed since this attack. Launch it again."),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Debrief" })).toHaveCount(0);
  });

  test("the lab has no detectable accessibility violations", async ({
    page,
  }) => {
    await page.goto("/akademiya/defend");
    await attack(page);
    const result = await new AxeBuilder({ page })
      .exclude("iframe")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});

test.describe("in Uzbek", () => {
  test.use({ storageState: locale("uz") });

  test("the lab and its scenarios are shown in Uzbek", async ({ page }) => {
    await page.goto("/akademiya/defend");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Hujumdan omon qoling.",
    );
    await expect(
      page.getByRole("heading", { level: 2, name: "Izohlar devori" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Hujumni boshlash" }).click();
    await expect(notice(page)).toContainText("ta hujumdan");
  });
});
