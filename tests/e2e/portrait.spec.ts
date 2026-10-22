import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

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

// A head-and-shoulders figure on a plain background, as a phone photo would be.
async function photo() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
    <rect width="600" height="800" fill="#eef1f5"/>
    <path d="M60 800 C 80 600, 200 560, 300 560 C 400 560, 520 600, 540 800 Z" fill="#2d3a5a"/>
    <ellipse cx="300" cy="350" rx="130" ry="165" fill="#d9a483"/>
    <path d="M170 330 C 170 170, 430 170, 430 330 C 410 240, 190 240, 170 330 Z" fill="#231a14"/>
  </svg>`;
  return {
    name: "me.jpg",
    mimeType: "image/jpeg",
    buffer: await sharp(Buffer.from(svg)).jpeg().toBuffer(),
  };
}

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

test("the home portrait endpoint serves valid points without signing in", async ({
  request,
}) => {
  const response = await request.get("/api/portrait");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.aspect).toBeGreaterThan(0);
  expect(body.points.length % 3).toBe(0);
  expect(response.headers()["cache-control"]).toContain("public");
});

test.describe("portraits", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD for a seeded admin account",
  );
  test.describe.configure({ mode: "serial" });

  async function adminLogin(page: Page) {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  }

  test("an admin replaces the home page portrait and restores the default", async ({
    page,
    request,
  }) => {
    await adminLogin(page);
    await page.getByRole("link", { name: "Home page portrait" }).click();
    await expect(page).toHaveURL(/\/admin\/portrait$/);
    await expect(
      page.getByText("The default portrait is shown."),
    ).toBeVisible();

    // Something that is not an image is refused in the browser.
    await page.getByLabel("New photo").setInputFiles({
      name: "notes.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
    await page.getByRole("button", { name: "Upload photo" }).click();
    await expect(
      page.getByText(
        "This image could not be read. Use a PNG, JPG or WebP photo.",
      ),
    ).toBeVisible();

    await page.getByLabel("New photo").setInputFiles(await photo());
    await page.getByRole("button", { name: "Upload photo" }).click();
    await expect(
      page.getByText("The home page portrait is updated."),
    ).toBeVisible();
    await expect(page.getByText(/Uploaded portrait, updated/)).toBeVisible();
    await expect(page.locator(".admin-portrait-canvas")).toBeVisible();

    // The home page now links the uploaded portrait by its version.
    const [versioned] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/portrait?v=")),
      page.goto("/"),
    ]);
    expect(versioned.status()).toBe(200);
    expect(versioned.headers()["cache-control"]).toContain("immutable");
    const uploaded = await versioned.json();
    const bundled = await (await request.get("/api/portrait")).json();
    expect(uploaded.points).toEqual(bundled.points);

    await page.goto("/admin/portrait");
    await page
      .getByRole("button", { name: "Restore the default portrait" })
      .click();
    await expect(
      page.getByText("The default portrait is shown."),
    ).toBeVisible();
    const restored = await (await request.get("/api/portrait")).json();
    expect(restored.points).not.toEqual(uploaded.points);
  });

  test("a student adds, sees and removes their own animated portrait", async ({
    page,
    browser,
  }) => {
    await adminLogin(page);
    const id = Date.now().toString(36);
    await page.goto("/teacher/students");
    await page
      .getByLabel("One student per line: Full name | group (group is optional)")
      .fill(`Portrait Student ${id}`);
    await page
      .getByRole("button", { name: "Create students and codes" })
      .click();
    const code = (await page
      .locator("code.student-code")
      .first()
      .textContent())!;

    const student = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await student.goto("/student/login");
    await student.getByLabel("Access code").fill(code);
    await student.getByRole("button", { name: "Enter" }).click();
    await expect(student).toHaveURL(/\/student$/);
    await expect(student.locator(".student-portrait-canvas")).toHaveCount(0);

    await student.getByText("Add your photo").click();
    await audit(student, "student home with the photo form open");
    await student.getByLabel("Your photo").setInputFiles(await photo());
    await student.getByRole("button", { name: "Upload photo" }).click();
    await expect(student.getByText("Your portrait is ready.")).toBeVisible();
    await expect(student.locator(".student-portrait-canvas")).toBeVisible();
    await student.reload();
    await expect(student.locator(".student-portrait-canvas")).toBeVisible();

    await student.getByText("Change your photo").click();
    await student.getByRole("button", { name: "Remove portrait" }).click();
    await expect(student.getByText("Add your photo")).toBeVisible();
    await expect(student.locator(".student-portrait-canvas")).toHaveCount(0);
  });
});
