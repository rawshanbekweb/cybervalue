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
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".nl-task .nl-pass")).toContainText(
    "Lesson completed",
  );
}

async function type(page: Page, command: string) {
  await page.locator("#bb-line").fill(command);
  await page.locator("#bb-line").press("Enter");
}

test("the Bash lab runs variables, loops and scripts in its terminal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Variables land on the shelf and print.
  await page.goto("/akademiya/bash#lesson/2");
  await type(page, "NAME = Ali");
  await expect(page.locator(".bb-error").last()).toContainText(
    "command not found",
  );
  await type(page, "NAME=Ali");
  await expect(page.locator(".bb-box")).toContainText("Ali");
  await type(page, 'echo "Salom, $NAME"');
  await expect(page.locator(".bb-screen")).toContainText("Salom, Ali");
  await expect(page.locator(".bb-goals li.met")).toHaveCount(2);
  await pass(page);
  await audit(page, "terminal");

  // The loop goes round once per file.
  await page.goto("/akademiya/bash#lesson/5");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.locator(".bb-screen div")).toHaveCount(3);
  await pass(page);
  await audit(page, "loop");

  // An endless loop is stopped; the fix prints the countdown.
  await page.goto("/akademiya/bash#lesson/7");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator(".bb-error")).toContainText("is the loop endless?");
  const editor = page.getByLabel("countdown.sh");
  await editor.fill(
    (await editor.inputValue()).replace(/ {2}# .*\n/, "  i=$((i - 1))\n"),
  );
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator(".bb-output")).toContainText("Start!");
  await pass(page);

  // The security script reads its argument.
  await page.goto("/akademiya/bash#lesson/8");
  await page.getByLabel("Arguments").fill("auth.log");
  const script = page.getByLabel("check.sh");
  await script.fill(
    (await script.inputValue()).replace("root ali", "root admin ali"),
  );
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator(".bb-output")).toContainText(
    "Ogohlantirish: admin",
  );
  await pass(page);
  await audit(page, "script");
});
