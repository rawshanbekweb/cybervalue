import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({
  storageState: {
    cookies: [
      {
        name: "cybervalue-locale",
        value: "en",
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  },
});

async function audit(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    label,
  ).toEqual([]);
}

async function pass(page: Page) {
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".nl-task .nl-pass")).toContainText(
    "Lesson completed",
  );
}

test("the HTTP basics lab animates requests and checks each lesson", async ({
  page,
}) => {
  // Without motion every message arrives at once.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/akademiya/http-basics");
  await expect(
    page.getByRole("heading", { level: 2, name: "Client and server" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".nl-fail")).toBeVisible();
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.locator(".al-log li")).toHaveCount(6);
  await pass(page);
  await audit(page, "sequence");

  // Every highlighted part of the request explains itself.
  await page.goto("/akademiya/http-basics#lesson/2");
  const parts = page.locator(".al-part");
  for (let i = 0; i < (await parts.count()); i++) await parts.nth(i).click();
  await expect(page.locator(".al-explain")).toContainText("Body");
  await pass(page);
  await audit(page, "anatomy");

  // GET puts the words in the address; POST keeps them in the body.
  await page.goto("/akademiya/http-basics#lesson/3");
  await page.getByRole("button", { name: "Send" }).first().click();
  await expect(page.locator(".hb-address")).toContainText("?q=mushuk");
  await page.getByRole("button", { name: "Send" }).nth(1).click();
  await expect(page.locator(".hb-request")).toContainText("user=ali");
  await pass(page);

  // Status codes go to their families; a wrong bucket is refused.
  await page.goto("/akademiya/http-basics#lesson/6");
  await page.getByRole("button", { name: "2xx · success" }).click();
  await expect(page.locator(".al-sort .nl-fail")).toBeVisible();
  for (const code of [4, 2, 3, 5, 4, 2, 5, 3, 4, 3])
    await page
      .locator(".al-bucket button")
      .nth(code - 2)
      .click();
  await expect(page.getByText("All sorted!")).toBeVisible();
  await pass(page);

  // Collect every family of codes from the practice server.
  await page.goto("/akademiya/http-basics#lesson/7");
  for (const path of ["/", "/old-page", "/missing", "/crash"]) {
    await page.getByLabel("Path").selectOption(path);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".hb-history li").first()).toContainText(path);
  }
  await expect(page.locator(".hb-families li.got")).toHaveCount(4);
  await pass(page);
  await audit(page, "talk");

  // The Network panel records the page's requests.
  await page.goto("/akademiya/http-basics#lesson/8");
  await page.getByRole("button", { name: "Reload page" }).click();
  await expect(page.locator(".hb-row")).toHaveCount(7);
  const answers = ["/logo.png", "/api/user", "/api/stats", "/old-logo.png"];
  for (const [i, answer] of answers.entries())
    await page
      .locator(".al-quiz fieldset")
      .nth(i)
      .getByLabel(answer, { exact: true })
      .check();
  await pass(page);
  await audit(page, "network panel");

  // Progress survives a reload.
  await page.reload();
  await expect(page.locator(".nl-sidebar .nl-done")).toHaveCount(6);
});
