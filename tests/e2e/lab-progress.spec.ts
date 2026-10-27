import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Browser } from "@playwright/test";
import { Client } from "pg";

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

const KEY = "cybervalue:network:progress:v1";

test("old addresses redirect to the new ones", async ({ request }) => {
  for (const [from, to] of [
    ["/playground", "/akademiya"],
    ["/playground/network-basics", "/akademiya/network-basics"],
    ["/playground/junior", "/junior"],
    ["/playground/junior/ciphers", "/junior/ciphers"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(new URL(response.headers().location, "http://x").pathname).toBe(to);
  }
});

test.describe("lab progress follows the student", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");

  async function signedIn(browser: Browser, code: string) {
    const page = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    return page;
  }

  test("lessons finished on one device show on another and on the student page", async ({
    browser,
  }) => {
    const code = [...randomBytes(16)]
      .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
      .join("");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, "updatedAt", "codeHash")
       VALUES ($1, 'Lab Walker', now(), $2)`,
      [`e2e_${randomUUID()}`, createHash("sha256").update(code).digest("hex")],
    );
    await client.end();

    // Device one: two lessons done in this browser, then the lab page syncs.
    const first = await signedIn(browser, code);
    // Progress already in this browser before the lab page loads.
    await first.addInitScript((key) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify({ 1: true, 2: true }));
    }, KEY);
    const saved = first.waitForResponse(
      (r) =>
        r.url().includes("/student/api/progress") &&
        r.request().method() === "PUT",
    );
    await first.goto("/akademiya/network-basics");
    expect((await saved).ok()).toBe(true);
    await first.context().close();

    // Device two starts empty and receives both lessons.
    const second = await signedIn(browser, code);
    await second.goto("/akademiya/network-basics");
    await expect(second.locator("#nl-progress")).toHaveAttribute("value", "2");
    expect(
      await second.evaluate((key) => localStorage.getItem(key), KEY),
    ).toContain('"2":true');

    await second.goto("/student");
    const card = second
      .locator("#path .student-path-card")
      .filter({ hasText: "IP addressing lab" });
    await expect(card).toContainText("2 of 17 lessons");
    await expect(card.getByRole("link", { name: /Continue/ })).toHaveAttribute(
      "href",
      "/akademiya/network-basics",
    );
    // The next-step card picks the started lab up where it stopped.
    await expect(second.locator(".student-next")).toContainText(
      "Lesson 3 of 17",
    );
    await second.context().close();
  });
});
