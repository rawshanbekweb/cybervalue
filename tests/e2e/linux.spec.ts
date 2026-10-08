import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { LESSONS } from "../../src/lib/linux/curriculum";

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

async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", {
    name: "Terminal command",
    exact: true,
  });
  await input.fill(command);
  await input.press("Enter");
  await expect(input).toHaveValue("");
}

test("Labs and Linux resources link to the terminal course", async ({
  page,
}) => {
  await page.goto("/labs");
  await page.getByRole("link", { name: "Open Linux lab" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Linux, terminal and shell",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/resources");
  await expect(
    page.getByRole("link", { name: "Open Linux lab" }),
  ).toHaveAttribute("href", "/playground/linux-basics");
});

test("catalog opens Linux, every lesson can be completed, progress resumes", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/playground");
  await page
    .locator(".learn-card-linux")
    .getByRole("link", { name: "Start learning" })
    .click();
  await expect(page).toHaveURL(/linux-basics#lesson\/1$/);
  await page.getByRole("button", { name: "Check result", exact: true }).click();
  await expect(page.locator(".lx-feedback")).toContainText("Not finished");
  for (const lesson of LESSONS) {
    await page
      .getByRole("navigation", { name: "Linux lessons" })
      .getByRole("link", {
        name: new RegExp(
          lesson.title.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        ),
      })
      .click();
    await expect(
      page.getByRole("heading", { name: lesson.title.en, exact: true }),
    ).toBeVisible();
    for (const hint of lesson.hint) await run(page, hint);
    await page
      .locator('.lx-quiz input[type="radio"]')
      .nth(lesson.quiz.answer)
      .check();
    await page
      .getByRole("button", { name: "Check result", exact: true })
      .click();
    await expect(page.locator(".lx-feedback")).toContainText(
      "Lesson completed!",
    );
    await expect(page.locator("#lx-progress")).toHaveAttribute(
      "value",
      String(lesson.id),
    );
  }
  await page.reload();
  await expect(page.locator("#lx-progress")).toHaveAttribute("value", "16");
  await expect(page.locator(".lx-complete-badge")).toContainText("Completed");
  await page.goto("/playground");
  await expect(
    page.locator(".learn-card-linux").getByRole("progressbar"),
  ).toHaveAttribute("value", "16");
});

test("terminal history, completion, quotes, file preview, export, reload and independent sessions", async ({
  page,
}) => {
  await page.goto("/playground/linux-basics#lesson/5");
  const input = page.getByRole("textbox", {
    name: "Terminal command",
    exact: true,
  });
  await input.fill("pw");
  await input.press("Tab");
  await expect(input).toHaveValue("pwd");
  await input.press("Enter");
  await run(page, 'echo "hello <script>alert(1)</script>" > custom.txt');
  await input.press("ArrowUp");
  await expect(input).toHaveValue(
    'echo "hello <script>alert(1)</script>" > custom.txt',
  );
  await page.getByRole("button", { name: /~\/custom.txt/ }).click();
  await expect(page.locator(".lx-file-preview pre")).toHaveText(
    "hello <script>alert(1)</script>\n",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download file", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("custom.txt");
  await input.fill("echo unfinished");
  await page.reload();
  await expect(input).toHaveValue("echo unfinished");
  await run(page, "cat custom.txt");
  await expect(page.locator(".lx-output")).toContainText(
    "hello <script>alert(1)</script>",
  );
  await page
    .getByRole("button", { name: "Free practice", exact: true })
    .click();
  await run(page, "cat custom.txt");
  await expect(page.locator(".lx-output")).toContainText("No such file");
  await page.getByRole("tab", { name: "Command reference" }).click();
  await page.getByRole("textbox", { name: "Search commands" }).fill("grep");
  await expect(page.locator(".lx-command-list article")).toHaveCount(1);
  await page
    .locator(".lx-command-list")
    .getByRole("button", { name: "Syntax" })
    .click();
  await expect(input).toHaveValue("help grep");
  const report = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  expect((await report).suggestedFilename()).toBe("linux-practice-report.txt");
});

test("reset requires confirmation and only resets the current lesson", async ({
  page,
}) => {
  await page.goto("/playground/linux-basics#lesson/1");
  await run(page, "pwd");
  await run(page, "whoami");
  await page.getByRole("radio", { name: "Shell", exact: true }).check();
  await page.getByRole("button", { name: "Check result" }).click();
  await run(page, "echo keep > custom.txt");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Reset exercise" }).click();
  await expect(
    page.getByRole("button", { name: /~\/custom.txt/ }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset exercise" }).click();
  await expect(page.getByRole("button", { name: /~\/custom.txt/ })).toHaveCount(
    0,
  );
  await expect(page.locator("#lx-progress")).toHaveAttribute("value", "0");
  await expect(page.locator(".lx-entry")).toHaveCount(0);
});

test("corrupt local storage and unavailable storage do not break practice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cybervalue:linux:session:1:v1",
      JSON.stringify({
        shell: { files: { "/": null } },
        transcript: [null],
        events: [false],
        draft: 99,
      }),
    );
    localStorage.setItem(
      "cybervalue:linux:progress:v1",
      JSON.stringify({ 1: "true", 999: true }),
    );
  });
  await page.goto("/playground/linux-basics");
  await expect(page.locator("#lx-progress")).toHaveAttribute("value", "0");
  await run(page, "pwd");
  await expect(page.locator(".lx-output")).toContainText("/home/student");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Unavailable", "QuotaExceededError");
    };
  });
  await run(page, "echo still-working");
  await expect(page.locator(".lx-output")).toContainText("still-working");
  await expect(page.locator(".lx-storage-warning")).toBeVisible();
});

test("Uzbek lesson and progress survive a language change", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/playground/linux-basics#lesson/13");
  await expect(
    page.getByRole("heading", {
      name: "Foydalanuvchilar va ruxsatlar",
      exact: true,
    }),
  ).toBeVisible();
  const input = page.getByRole("textbox", {
    name: "Terminal buyrug‘i",
    exact: true,
  });
  await input.fill("chmod 640 documents/notes.txt");
  await input.press("Enter");
  await context.addCookies([
    { name: "cybervalue-locale", value: "en", domain: "localhost", path: "/" },
  ]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Users and permissions", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /~\/documents\/notes.txt 640/ }),
  ).toBeVisible();
});

test("responsive Linux workspace is accessible on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/playground/linux-basics");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({
    path: "test-results/linux-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/linux-mobile.png",
    fullPage: true,
  });
});
