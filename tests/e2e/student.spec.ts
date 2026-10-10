import { test, expect, type Page } from "@playwright/test";

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

test("the student area requires a code, stays noindex and hides which part failed", async ({
  page,
}) => {
  await page.goto("/student");
  await expect(page).toHaveURL(/\/student\/login$/);
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
  await page.getByLabel("Access code").fill("AAAA-BBBB-CCCC-DDDD");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(
    page.getByText("This access code is not valid or no longer active."),
  ).toBeVisible();
  await page.goto("/student/m/anything");
  await expect(page).toHaveURL(/\/student\/login$/);
});

test.describe("admin-issued access", () => {
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

  async function createMaterial(
    page: Page,
    fields: { title: string; slug: string; kind: string; body: string },
    extra?: (page: Page) => Promise<void>,
  ) {
    await page.goto("/admin/materials/new");
    await page.getByLabel("Title", { exact: true }).fill(fields.title);
    await page.getByLabel("Slug").fill(fields.slug);
    await page.getByLabel("Kind").selectOption(fields.kind);
    await page.getByLabel("Groups (comma-separated)").fill(group);
    await page.getByLabel("Body (Markdown)").fill(fields.body);
    await extra?.(page);
    await page.getByLabel("Visible to students").check();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Material created.")).toBeVisible();
    return page.url();
  }

  const id = Date.now().toString(36);
  const group = `e2e-${id}`;
  const urls: string[] = [];

  test("admin creates materials and a student; the student learns with the code", async ({
    page,
    browser,
  }) => {
    await adminLogin(page);
    urls.push(
      await createMaterial(page, {
        title: `Private lesson ${id}`,
        slug: `e2e-lesson-${id}`,
        kind: "LESSON",
        body: "## Secret notes\n\nOnly for the class.",
      }),
    );
    // An invalid quiz is rejected without losing what was typed.
    await page.goto("/admin/materials/new");
    await page.getByLabel("Title", { exact: true }).fill(`Quiz ${id}`);
    await page.getByLabel("Slug").fill(`e2e-quiz-${id}`);
    await page.getByLabel("Kind").selectOption("QUIZ");
    await page.getByLabel("Questions").fill("? Two answers\n+ a\n+ b");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator(".admin-error")).toContainText("Question 1");
    await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
      `Quiz ${id}`,
    );
    urls.push(
      await createMaterial(
        page,
        {
          title: `Quiz ${id}`,
          slug: `e2e-quiz-${id}`,
          kind: "QUIZ",
          body: "Answer both.",
        },
        async (p) => {
          await p
            .getByLabel("Questions")
            .fill(
              "? Default HTTPS port?\n- 80\n+ 443\n\n? Safe password storage?\n+ A slow salted hash\n- Plain text",
            );
          await p.getByLabel("Attempts per student (0 = unlimited)").fill("1");
        },
      ),
    );
    urls.push(
      await createMaterial(page, {
        title: `Practice ${id}`,
        slug: `e2e-practice-${id}`,
        kind: "PRACTICE",
        body: "Explain the finding.",
      }),
    );

    await page.goto("/admin/students");
    await page
      .getByLabel("One student per line: Full name | group (group is optional)")
      .fill(`Test Student ${id} | ${group}`);
    await page
      .getByRole("button", { name: "Create students and codes" })
      .click();
    const code = (await page
      .locator("code.student-code")
      .first()
      .textContent())!;
    expect(code).toMatch(/^[0-9A-Z]{4}(-[0-9A-Z]{4}){3}$/);

    const student = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await student.goto("/student/login");
    // Lower case and no dashes still work.
    await student
      .getByLabel("Access code")
      .fill(code.replace(/-/g, "").toLowerCase());
    await student.getByRole("button", { name: "Enter" }).click();
    await expect(student).toHaveURL(/\/student$/);
    await expect(
      student.getByRole("heading", { name: "Hello, Test." }),
    ).toBeVisible();
    await expect(student.getByText(`Group ${group}`)).toBeVisible();

    await student.getByRole("link", { name: `Private lesson ${id}` }).click();
    await expect(
      student.getByRole("heading", { name: "Secret notes" }),
    ).toBeVisible();
    await student.getByRole("button", { name: "Mark as complete" }).click();
    await expect(student.getByText(/Completed on/)).toBeVisible();

    await student.goto(`/student/m/e2e-quiz-${id}`);
    expect(await student.content()).not.toContain('"answer"');
    await student.getByLabel("443").check();
    await student.getByLabel("A slow salted hash").check();
    await student.getByRole("button", { name: "Submit answers" }).click();
    await expect(student.getByText("Latest result: 2 of 2")).toBeVisible();
    await expect(student.getByText("Correct", { exact: true })).toHaveCount(2);
    await student.reload();
    await expect(
      student.getByText("You have used all attempts for this test."),
    ).toBeVisible();

    await student.goto(`/student/m/e2e-practice-${id}`);
    await student
      .getByLabel("Write your solution, findings or a link to your work")
      .fill("The form trusted a hidden price field.");
    await student.getByRole("button", { name: "Submit" }).click();
    await expect(
      student.getByText("Submitted. Your teacher will review it."),
    ).toBeVisible();
    await expect(student.getByText("Waiting for review")).toBeVisible();

    // The teacher reviews the practice answer.
    await page.goto(urls[2]);
    await page.getByLabel("Score (0–100)").fill("90");
    await page.getByLabel("Feedback for the student").fill("Good reasoning.");
    await page.getByRole("button", { name: "Save review" }).click();
    await expect(page.getByText("Review saved.")).toBeVisible();
    await student.reload();
    await expect(student.getByText("Reviewed · 90 points")).toBeVisible();
    await expect(student.getByText("Good reasoning.")).toBeVisible();

    // Other published materials may exist, so check these three by name.
    await student.goto("/student");
    for (const title of [
      `Private lesson ${id}`,
      `Quiz ${id}`,
      `Practice ${id}`,
    ])
      await expect(
        student.getByRole("link", { name: title }).getByText("Done"),
      ).toBeVisible();

    // Blocking access ends the open session immediately.
    await page.goto("/admin/students");
    await page.getByRole("link", { name: `Test Student ${id}` }).click();
    await page
      .getByLabel("Access allowed (turning it off signs the student out)")
      .uncheck();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await student.reload();
    await expect(student).toHaveURL(/\/student\/login$/);

    // Cleanup.
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete student" }).click();
    await expect(page).toHaveURL(/\/admin\/students$/);
    for (const url of urls) {
      await page.goto(url);
      await page.getByRole("button", { name: "Delete material" }).click();
      await expect(page).toHaveURL(/\/admin\/materials$/);
    }
  });
});
