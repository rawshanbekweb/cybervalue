import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

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

const newCode = () =>
  [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");

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

test("the module is on the roadmap and locked for visitors", async ({
  page,
}) => {
  await page.goto("/intermediate");
  await expect(
    page.locator("#netsec").getByRole("link", { name: /Traffic analysis/ }),
  ).toHaveAttribute("href", "/intermediate/traffic");
  await page.goto("/intermediate/traffic");
  await expect(
    page.getByRole("heading", { name: "This lab is part of Intermediate." }),
  ).toBeVisible();
});

test.describe("an Intermediate student", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  const id = randomUUID();
  const code = newCode();

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, level, "codeHash", "updatedAt")
       VALUES ($1, 'Traffic Pupil', 'intermediate', $2, now())`,
      [id, createHash("sha256").update(code).digest("hex")],
    );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = $1`, [id]);
    await client.end();
  });

  test("a filter for the scan, a password and the beacon", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/traffic#lesson/2");
    const filter = page.getByLabel("Display filter");
    const rows = page.locator(".tr-packets tbody tr");
    await expect(rows).toHaveCount(15);
    await filter.fill("ip.srcc == 1");
    await expect(page.locator(".cb-out")).toContainText("Unknown field");
    await filter.fill("tcp.flags.syn == 1 && tcp.flags.ack == 0");
    await expect(rows).toHaveCount(5);
    await filter.fill(
      "ip.src == 10.0.0.66 && tcp.flags.syn == 1 && tcp.flags.ack == 0",
    );
    await expect(rows).toHaveCount(4);
    await expect(page.locator(".cb-out")).toContainText("Exactly");
    await pass(page);
    await audit(page, "filter");

    await page.goto("/intermediate/traffic#lesson/4");
    await page.getByRole("button", { name: /Follow TCP stream/ }).click();
    const token = (await page.locator(".tr-stream").innerText())
      .split("Basic ")[1]
      .split("\n")[0]
      .trim();
    await page.getByLabel("Base64 decoder").fill(token);
    await expect(page.locator(".cb-out")).toContainText("ali:Toshkent2026");
    await page.getByLabel("The password").fill("Toshkent2026");
    await pass(page);
    await audit(page, "stream");

    await page.goto("/intermediate/traffic#lesson/6");
    await page.getByLabel(/10\.0\.0\.5/).check();
    await expect(page.locator(".ac-reply")).toHaveClass(/bad/);
    await page.getByLabel(/10\.0\.0\.9/).check();
    await expect(page.locator(".ac-reply")).toHaveClass(/ok/);
    await pass(page);
    await audit(page, "beacon");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/traffic");
  await expect(page).toHaveTitle(/Trafik tahlili/);
});
