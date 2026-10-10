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

  test("personal labs hand out per-student flags and flag shared answers", async ({
    page,
    browser,
  }) => {
    const lab = `e2e-lab-${id}`;
    await adminLogin(page);
    const labUrl = await createMaterial(
      page,
      {
        title: `Log hunt ${id}`,
        slug: lab,
        kind: "CHALLENGE",
        body: "Find your flag in the log.",
      },
      async (p) => {
        await p.getByLabel("File name").fill("access.log");
        await p
          .getByLabel("Artifact template")
          .fill("user={{name}}\ndebug={{decoy}}\npayload={{flag:base64}}");
        await p.getByLabel("Attempts per student (0 = unlimited)").fill("0");
      },
    );

    await page.goto("/admin/students");
    await page
      .getByLabel("One student per line: Full name | group (group is optional)")
      .fill(`Lab One ${id} | ${group}\nLab Two ${id} | ${group}`);
    await page
      .getByRole("button", { name: "Create students and codes" })
      .click();
    await expect(page.locator("code.student-code")).toHaveCount(2);
    const codes = await page.locator("code.student-code").allTextContents();

    async function signIn(code: string) {
      const context = await browser.newContext({ storageState: english });
      const student = await context.newPage();
      await student.goto("/student/login");
      await student.getByLabel("Access code").fill(code);
      await student.getByRole("button", { name: "Enter" }).click();
      await expect(student).toHaveURL(/\/student$/);
      await student.goto(`/student/m/${lab}`);
      const download = student.waitForEvent("download");
      await student.getByRole("link", { name: "Download access.log" }).click();
      const file = await download;
      expect(file.suggestedFilename()).toBe("access.log");
      const text = await (await file.createReadStream()).toArray();
      const lines = Buffer.concat(text).toString("utf8").split("\n");
      return {
        student,
        name: lines[0].slice("user=".length),
        decoy: lines[1].slice("debug=".length),
        flag: Buffer.from(
          lines[2].slice("payload=".length),
          "base64",
        ).toString(),
      };
    }

    const one = await signIn(codes[0]);
    const two = await signIn(codes[1]);
    expect(one.name).toBe(`Lab One ${id}`);
    expect(one.flag).toMatch(/^CV\{[a-f0-9]{24}\}$/);
    expect(one.flag).not.toBe(two.flag);

    // A decoy and a classmate's flag are both rejected the same way.
    for (const [who, guess] of [
      [one, one.decoy],
      [two, one.flag],
    ] as const) {
      await who.student.getByLabel("Flag").fill(guess);
      await who.student.getByRole("button", { name: "Check flag" }).click();
      await expect(
        who.student.getByText("That is not your flag. Keep investigating."),
      ).toBeVisible();
    }
    await one.student.getByLabel("Flag").fill(one.flag);
    await one.student.getByRole("button", { name: "Check flag" }).click();
    await expect(one.student.getByText(/Solved on/)).toBeVisible();
    await expect(one.student.getByLabel("Flag")).toHaveCount(0);

    await page.goto(labUrl);
    await expect(page.getByText("1 of 2 students solved it.")).toBeVisible();
    const rowOne = page.getByRole("row", {
      name: new RegExp(`^Lab One ${id}`),
    });
    const rowTwo = page.getByRole("row", {
      name: new RegExp(`^Lab Two ${id}`),
    });
    await expect(rowOne).toContainText(one.flag);
    await expect(rowOne).toContainText("Sent a decoy flag");
    await expect(rowOne).toContainText(`Their flag was sent by Lab Two ${id}`);
    await expect(rowOne).toContainText(/Solved .* 2 attempts/);
    await expect(rowTwo).toContainText(`Sent the flag of Lab One ${id}`);
    await expect(rowTwo).toContainText("1 wrong attempts");

    // Cleanup.
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete material" }).click();
    await expect(page).toHaveURL(/\/admin\/materials$/);
    for (const name of [`Lab One ${id}`, `Lab Two ${id}`]) {
      await page.goto("/admin/students");
      await page.getByRole("link", { name }).click();
      await page.getByRole("button", { name: "Delete student" }).click();
      await expect(page).toHaveURL(/\/admin\/students$/);
    }
  });
});
