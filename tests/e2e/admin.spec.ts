import { test, expect } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test("unauthenticated /admin redirects to login and stays noindex", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute("content");
  expect(robots).toContain("noindex");
});

test("wrong credentials show a generic error, not which field was wrong", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrong-password-1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test.describe("authenticated CRUD flow", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD for a seeded admin account",
  );

  test("login, publish a draft so it goes live, then archive and delete it", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const slug = `e2e-test-project-${Date.now()}`;
    await page.goto("/admin/work/new");
    await page.getByLabel("Slug", { exact: true }).fill(slug);
    await page.getByLabel("Title", { exact: true }).fill("E2E Test Project");
    await page
      .getByLabel("Summary", { exact: true })
      .fill("A summary long enough to pass the minimum length check.");
    await page
      .getByLabel("Body (Markdown)")
      .fill("Body content written for the automated end-to-end test.");
    await page.getByLabel("Problem").fill("Problem text");
    await page.getByLabel("Objective").fill("Objective text");
    await page.getByLabel("Architecture").fill("Architecture text");
    await page.getByLabel("Security considerations").fill("Security text");
    await page.getByLabel("Challenges").fill("Challenges text");
    await page.getByLabel("Solution").fill("Solution text");
    await page.getByLabel("Result").fill("Result text");
    await page.getByLabel("Lessons learned").fill("Lessons text");
    await page.getByLabel("Project status").fill("Active");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page).toHaveURL(/\/admin\/work$/);

    const draftRow = page.getByRole("row", { name: /E2E Test Project/ });
    await expect(draftRow).toContainText("DRAFT");
    expect((await page.request.get(`/work/${slug}`)).status()).toBe(404);

    await page.getByLabel("Search work").fill(slug);
    await page.getByLabel("Status", { exact: true }).selectOption("DRAFT");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(draftRow).toBeVisible();
    await page.getByLabel("Status", { exact: true }).selectOption("ARCHIVED");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(draftRow).toHaveCount(0);
    await expect(
      page.getByText(/No entries match these filters/),
    ).toBeVisible();
    await page.getByRole("link", { name: "Reset", exact: true }).click();

    page.on("dialog", (dialog) => dialog.accept());

    await draftRow.getByRole("button", { name: "Publish" }).click();
    await expect(draftRow).toContainText("PUBLISHED");
    expect((await page.request.get(`/work/${slug}`)).status()).toBe(200);

    await draftRow.getByRole("button", { name: "Move to draft" }).click();
    await expect(draftRow).toContainText("DRAFT");
    expect((await page.request.get(`/work/${slug}`)).status()).toBe(404);
    await draftRow.getByRole("button", { name: "Publish" }).click();
    await expect(draftRow).toContainText("PUBLISHED");

    await draftRow.getByRole("button", { name: "Archive" }).click();
    await expect(draftRow).toContainText("ARCHIVED");
    expect((await page.request.get(`/work/${slug}`)).status()).toBe(404);

    await draftRow.getByRole("button", { name: "Delete" }).click();
    await expect(draftRow).toHaveCount(0);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
