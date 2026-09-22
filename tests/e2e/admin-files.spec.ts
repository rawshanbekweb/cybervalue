import { test, expect } from "@playwright/test";
import sharp from "sharp";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const prefix = process.env.E2E_FILE_PREFIX ?? `e2e-${Date.now()}`;

test("upload endpoint requires sign-in and rejects foreign origins", async ({
  request,
}) => {
  const signedOut = await request.post("/admin/uploads", {
    headers: {
      origin: "http://localhost:3000",
      "x-file-name": "test.txt",
      "x-file-kind": "RESOURCE",
    },
    data: "hello",
  });
  expect(signedOut.status()).toBe(401);
  const foreign = await request.post("/admin/uploads", {
    headers: {
      origin: "https://foreign.example",
      "x-file-name": "test.txt",
      "x-file-kind": "RESOURCE",
    },
    data: "hello",
  });
  expect(foreign.status()).toBe(403);
});

test("upload, publish, protect referenced files, unpublish and remove unused files", async ({
  page,
  request,
}) => {
  test.skip(!email || !password, "Requires a test admin account");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const resourceName = `${prefix}-guide.txt`;
  const imageName = `${prefix}-image.png`;
  const slug = `${prefix}-resource`;
  await page.goto("/admin/resources/new");
  await page.getByLabel("Slug", { exact: true }).fill(slug);
  await page
    .getByLabel("Title", { exact: true })
    .fill("Upload integration resource");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("A resource description long enough for the validation rules.");
  await page.getByLabel("Body (Markdown)").fill("Resource test body.");
  await page.getByLabel("Type", { exact: true }).fill("Guide");
  await page.getByLabel("Topic", { exact: true }).fill("Testing");
  await page.getByLabel("Version", { exact: true }).fill("1.0");
  await page.getByLabel("Upload resource file").setInputFiles({
    name: resourceName,
    mimeType: "text/plain",
    buffer: Buffer.from("Resource upload test"),
  });
  await expect(
    page.getByRole("status").filter({ hasText: `${resourceName} uploaded.` }),
  ).toBeVisible();
  const resourcePath = await page
    .getByLabel("File path", { exact: true })
    .inputValue();

  const image = await sharp({
    create: { width: 40, height: 20, channels: 3, background: "green" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles({ name: imageName, mimeType: "image/png", buffer: image });
  await expect(page.getByLabel("Image 1 description")).toBeVisible();
  await page.getByLabel("Image 1 description").fill("A green test image");
  const images = JSON.parse(
    await page.locator('input[name="imagesJson"]').inputValue(),
  );
  const imagePath = images[0].path as string;
  expect((await request.get(imagePath)).status()).toBe(404);
  expect(
    (
      await request.get(`/admin/file?path=${encodeURIComponent(resourcePath)}`)
    ).status(),
  ).toBe(401);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/resources$/);
  const row = page.getByRole("row", { name: /Upload integration resource/ });
  await expect(row).toContainText("Available");
  expect((await request.get(`/downloads/${slug}`)).status()).toBe(404);

  await page.goto(`/admin/files?q=${encodeURIComponent(prefix)}`);
  page.on("dialog", (dialog) => dialog.accept());
  const resourceCard = page
    .getByRole("article")
    .filter({ hasText: resourceName });
  await resourceCard.getByRole("button", { name: "Delete file" }).click();
  await expect(resourceCard.getByRole("alert")).toContainText(
    "attached to content",
  );

  await page.goto("/admin/resources");
  await row.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(row).toContainText("PUBLISHED");
  const download = await request.get(`/downloads/${slug}`);
  expect(download.status()).toBe(200);
  expect(await download.text()).toBe("Resource upload test");
  expect(download.headers()["content-disposition"]).toContain("attachment");
  expect((await request.get(imagePath)).status()).toBe(200);
  await row.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(row).toContainText("ARCHIVED");
  expect((await request.get(imagePath)).status()).toBe(404);
  expect((await request.get(`/downloads/${slug}`)).status()).toBe(404);
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.goto(`/admin/files?q=${encodeURIComponent(prefix)}`);
  await resourceCard.getByRole("button", { name: "Delete file" }).click();
  await expect(resourceCard).toHaveCount(0);
  const imageCard = page.getByRole("article").filter({ hasText: imageName });
  await imageCard.getByRole("button", { name: "Delete file" }).click();
  await expect(imageCard).toHaveCount(0);
});

test("account password changes revoke old sessions and allow the new password", async ({
  page,
  browser,
}) => {
  test.skip(
    process.env.E2E_ISOLATED_ACCOUNT !== "true",
    "Requires an isolated disposable account and a single test worker",
  );
  test.skip(!email || !password, "Requires a test admin account");
  const other = await browser.newContext();
  const second = await other.newPage();
  for (const view of [page, second]) {
    await view.goto("/admin/login");
    await view.getByLabel("Email").fill(email!);
    await view.getByLabel("Password", { exact: true }).fill(password!);
    await view.getByRole("button", { name: "Sign in" }).click();
    await expect(view).toHaveURL(/\/admin$/);
  }
  await page.goto("/admin/account");
  await page.getByRole("button", { name: "Sign out other sessions" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Other sessions have been signed out",
  );
  await second.goto("/admin");
  await expect(second).toHaveURL(/\/admin\/login/);
  const nextPassword = `${password}-changed`;
  await page.getByLabel("Current password", { exact: true }).fill(password!);
  await page.getByLabel("New password", { exact: true }).fill(nextPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(nextPassword);
  await page
    .getByRole("button", { name: "Change password", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login\?changed=1/);
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  // Restore the test account's password for the other admin scenarios.
  await page.goto("/admin/account");
  await page.getByLabel("Current password", { exact: true }).fill(nextPassword);
  await page.getByLabel("New password", { exact: true }).fill(password!);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(password!);
  await page
    .getByRole("button", { name: "Change password", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login\?changed=1/);
  await other.close();
});
