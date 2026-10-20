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

async function type(page: Page, input: string) {
  await page.locator("#ss-line").fill(input);
  await page.locator("#ss-line").press("Enter");
}

test("the SSH lab connects, accepts the host key and signs in with a key", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/akademiya/ssh#lesson/3");
  await type(page, "ssh ali@server.uz");
  await expect(page.locator(".ss-screen")).toContainText("key fingerprint");
  await type(page, "yes");
  // The password field hides what is typed.
  await expect(page.locator("#ss-line")).toHaveAttribute("type", "password");
  await type(page, "kalit-2026");
  await expect(page.locator(".ss-tunnel")).toBeVisible();
  await type(page, "hostname");
  await expect(page.locator(".ss-screen")).toContainText("web-1");
  await type(page, "exit");
  await expect(page.locator(".ss-screen")).toContainText("closed");
  await expect(page.locator(".bb-goals li.met")).toHaveCount(4);
  await pass(page);
  await audit(page, "ssh client");

  await page.goto("/akademiya/ssh#lesson/5");
  for (const input of [
    "ssh-keygen -t ed25519",
    "ssh-copy-id ali@server.uz",
    "yes",
    "kalit-2026",
    "ssh ali@server.uz",
  ])
    await type(page, input);
  await expect(page.locator(".ss-tunnel")).toBeVisible();
  await expect(page.locator(".bb-goals li.met")).toHaveCount(3);
  await pass(page);

  await page.goto("/akademiya/ssh#lesson/1");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.locator(".al-log li")).toHaveCount(7);
  await pass(page);
  await audit(page, "ssh sequence");
});
