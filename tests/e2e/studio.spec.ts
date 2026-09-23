import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { studioSolutions } from "../fixtures/studio";

test("project editing, checks, independent drafts, reload, and exports", async ({
  page,
}) => {
  await page.goto("/playground");
  await page.getByRole("link", { name: "Open project studio" }).click();
  await page
    .getByRole("button", { name: "Check structure", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toContainText(
    "revise your page",
  );
  await page
    .getByLabel("HTML source", { exact: true })
    .fill(studioSolutions.incident);
  await expect(page.locator(".studio-check-summary")).toContainText(
    "Run the checks again",
  );
  await page
    .getByRole("button", { name: "Check structure", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toContainText(
    "Ready for your manual review",
  );
  await page
    .getByLabel("Design notes & review findings")
    .fill("Tested labels with keyboard navigation.");
  await page.getByRole("button", { name: "CSS", exact: true }).click();
  await page
    .getByLabel("CSS source", { exact: true })
    .fill("body { background: rgb(240, 245, 230); }");
  await expect(page.locator(".studio-check-summary")).toContainText(
    "Run the checks again",
  );
  await expect(
    page.frameLocator('iframe[title="Project preview"]').locator("body"),
  ).toHaveCSS("background-color", "rgb(240, 245, 230)");
  await page.getByRole("link", { name: /Clarity during an outage/ }).click();
  await page
    .getByLabel("HTML source", { exact: true })
    .fill(studioSolutions.status);
  await page
    .getByRole("button", { name: "Check structure", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toContainText(
    "Ready for your manual review",
  );
  await page.reload();
  await expect(page.getByLabel("HTML source", { exact: true })).toHaveValue(
    studioSolutions.status,
  );
  await page.getByRole("link", { name: /A report that gets heard/ }).click();
  await expect(page.getByLabel("HTML source", { exact: true })).toHaveValue(
    studioSolutions.incident,
  );
  await expect(page.getByLabel("Design notes & review findings")).toHaveValue(
    "Tested labels with keyboard navigation.",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export HTML", exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("incident.html");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Reset project", exact: true })
    .click();
  await expect(page.getByLabel("HTML source", { exact: true })).toHaveValue(
    studioSolutions.incident,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Reset project", exact: true })
    .click();
  await expect(page.getByLabel("Design notes & review findings")).toHaveValue(
    "",
  );
  await expect(page.getByLabel("HTML source", { exact: true })).not.toHaveValue(
    studioSolutions.incident,
  );
});

test("studio recovers storage, supports deep links, and isolates active preview content", async ({
  page,
}) => {
  await page.goto("/playground/studio");
  await page.evaluate(() =>
    localStorage.setItem(
      "cybervalue:studio:launch:v1",
      '{"html":42,"css":null}',
    ),
  );
  await page.goto("/playground/studio#project/launch");
  await expect(page.getByLabel("HTML source", { exact: true })).toHaveValue(
    /FIELD NOTES/,
  );
  await page
    .getByLabel("HTML source", { exact: true })
    .fill(studioSolutions.launch);
  await page
    .getByRole("button", { name: "Check structure", exact: true })
    .click();
  await expect(page.locator(".studio-check-summary")).toContainText(
    "Ready for your manual review",
  );
  await page
    .getByLabel("HTML source", { exact: true })
    .fill(
      '<h1>Safe preview</h1><script>document.body.textContent="Executed"</script><a href="https://example.com">External</a>',
    );
  await expect(
    page.frameLocator("iframe").getByRole("heading", { name: "Safe preview" }),
  ).toBeVisible();
  await expect(page.frameLocator("iframe").locator("script")).toHaveCount(0);
  await expect(page.frameLocator("iframe").locator("a")).not.toHaveAttribute(
    "href",
  );
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "");
});

test("studio fits small screens and its controls are accessible", async ({
  page,
}) => {
  await page.goto("/playground/studio");
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "Tablet", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  // The learner's unfinished document is reviewed separately from the studio controls.
  const result = await new AxeBuilder({ page })
    .exclude("iframe")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
