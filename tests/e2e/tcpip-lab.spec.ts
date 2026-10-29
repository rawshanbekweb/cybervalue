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
    page.locator("#netsec").getByRole("link", { name: /TCP\/IP in depth/ }),
  ).toHaveAttribute("href", "/intermediate/tcpip");
  await page.goto("/intermediate/tcpip");
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
       VALUES ($1, 'Tcp Pupil', 'intermediate', $2, now())`,
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

  test("handshake numbers and a resolver safe from poisoning", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/tcpip#lesson/2");
    await page.getByLabel("ack in the SYN-ACK").fill("1000");
    await expect(page.getByLabel("ack in the SYN-ACK")).toHaveClass(/bad/);
    await page.getByLabel("ack in the SYN-ACK").fill("1001");
    await page.getByLabel("seq in the ACK").fill("1001");
    await page.getByLabel("ack in the ACK").fill("7001");
    await page.getByLabel("ack after the data").fill("1101");
    await expect(page.locator(".cb-out")).toContainText("acknowledged");
    await pass(page);
    await audit(page, "handshake");

    await page.goto("/intermediate/tcpip#lesson/6");
    await expect(page.locator(".ac-reply")).toHaveClass(/bad/);
    await page.getByLabel("65 536").check();
    await expect(page.locator(".ac-reply")).toContainText("63.2%");
    await page.getByLabel("Send each query from a random source port").check();
    await expect(page.locator(".ac-reply")).toHaveClass(/ok/);
    await pass(page);
    await audit(page, "dns");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/tcpip");
  await expect(page).toHaveTitle(/TCP\/IP chuqurroq/);
});
