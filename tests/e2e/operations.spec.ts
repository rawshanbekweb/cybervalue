import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Assertions use the English interface copy.
const english = {
  cookies: [
    {
      name: "cybervalue-locale",
      value: "en",
      domain: "localhost",
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};
test.use({ storageState: english });

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

async function audit(page: Page, label: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
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

test("the site can be installed and has an offline page", async ({
  page,
  request,
}) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  const data = await manifest.json();
  expect(data.name).toBe("Cybervalue Academy");
  expect(data.icons.map((i: { sizes: string }) => i.sizes)).toContain(
    "512x512",
  );
  for (const icon of data.icons)
    expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
  const worker = await request.get("/sw.js");
  expect(worker.ok()).toBe(true);
  expect(worker.headers()["cache-control"]).toContain("no-store");
  expect(await worker.text()).toContain("PRIVATE");

  await page.goto("/offline");
  await expect(
    page.getByRole("heading", { level: 1, name: /No connection/ }),
  ).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  await audit(page, "offline");
});

test.describe("admin operations", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("system status checks the database and exports the data", async ({
    page,
  }) => {
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "System status" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "System status" }),
    ).toBeVisible();
    const database = page.locator(".admin-status li", { hasText: "Database" });
    await expect(database).toContainText("OK");
    await expect(database).toContainText(/Connected in \d+ ms/);
    await audit(page, "status");

    const response = await page.request.get("/admin/status/export");
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-disposition"]).toContain(
      "cybervalue-export-",
    );
    const data = await response.json();
    expect(Array.isArray(data.tables.students)).toBe(true);
    expect(data.tables.users[0]).not.toHaveProperty("passwordHash");
    await page.reload();
    await expect(
      page.locator(".admin-status li", { hasText: "Data export" }),
    ).toContainText("Last downloaded");
  });

  test("browser errors are grouped on the errors page", async ({ page }) => {
    const message = `E2E boom ${Date.now().toString(36)}`;
    // Another site cannot report errors.
    expect(
      (
        await page.request.post("/api/errors", {
          headers: { Origin: "https://evil.example" },
          data: { message },
        })
      ).status(),
    ).toBe(403);
    for (let i = 0; i < 2; i++)
      expect(
        (
          await page.request.post("/api/errors", {
            headers: { Origin: new URL(page.url()).origin },
            data: {
              message,
              path: "/report/AAAAAAAAAAAAAAAAAAAAAAAA?x=1",
            },
          })
        ).status(),
      ).toBe(204);
    await page.goto("/admin/errors");
    const item = page.locator(".admin-errors li", { hasText: message });
    await expect(item).toContainText("2 times");
    await expect(item).toContainText("/report/:id");
    await audit(page, "errors");
    await item.getByRole("button", { name: "Resolved" }).click();
    await expect(
      page.locator(".admin-errors li", { hasText: message }),
    ).toHaveCount(0);
  });
});
