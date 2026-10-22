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

test("the cryptography lab: bytes, Base64, hashes, salt and a dictionary attack", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/akademiya/crypto#lesson/1");
  await expect(
    page.getByRole("heading", { level: 1, name: /Cryptography basics/ }),
  ).toBeVisible();
  await page.getByLabel("2", { exact: true }).check();
  await expect(page.locator(".cb-card .nl-fail")).toBeVisible();
  await page.getByLabel("3", { exact: true }).check();
  await pass(page);
  await audit(page, "bytes");

  // Open the cookie, then forge admin=true.
  await page.goto("/akademiya/crypto#lesson/2");
  await page.getByLabel("Decode Base64").fill("YWRtaW49ZmFsc2U=");
  await expect(page.locator(".cb-out.ok")).toHaveText("admin=false");
  await page.getByLabel("Encode to Base64").fill("admin=true");
  await page.getByLabel("Forged cookie value").fill("YWRtaW49dHJ1ZQ==");
  await pass(page);

  // One letter apart: the hashes fall apart.
  await page.goto("/akademiya/crypto#lesson/4");
  await page.getByLabel("Text B").fill("Salom");
  await expect(page.locator(".cb-meter")).toContainText("of 256 bits differ");
  await pass(page);
  await audit(page, "avalanche");

  // Only the second mirror matches.
  await page.goto("/akademiya/crypto#lesson/5");
  const mirrors = page.getByRole("button", { name: "This one matches" });
  await mirrors.first().click();
  await expect(page.locator(".cb-card .nl-fail")).toBeVisible();
  await mirrors.nth(1).click();
  await pass(page);

  // Equal unsalted hashes, then salt.
  await page.goto("/akademiya/crypto#lesson/6");
  await page.getByLabel("Mark aziza").check();
  await page.getByLabel("Mark dilnoza").check();
  await page.getByText("sha256(salt + password)").click();
  await expect(page.locator(".cb-card .nl-pass")).toContainText(
    "every hash is different",
  );
  await pass(page);
  await audit(page, "salt");

  await page.goto("/akademiya/crypto#lesson/7");
  await page.getByRole("button", { name: "Start the attack" }).click();
  await expect(page.locator(".cb-attempts li.ok")).toContainText("lola2010");
  await page.getByLabel("The password is").fill("lola2010");
  await pass(page);
});

test("the cryptography lab: XOR, key length and a signature that catches tampering", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  // 0x2a = 00101010: bits 3, 5 and 7.
  await page.goto("/akademiya/crypto#lesson/8");
  for (const n of [3, 5, 7])
    await page.getByRole("button", { name: `Key bit ${n}` }).click();
  await expect(page.locator(".cb-card .nl-pass")).toContainText("As a letter");
  await expect(page.locator(".cb-card .nl-pass strong")).toHaveText("C");
  await pass(page);
  await audit(page, "xor");

  await page.goto("/akademiya/crypto#lesson/9");
  await page.getByRole("slider").fill("85");
  await expect(page.locator(".cb-card .nl-pass")).toContainText("85 bits");
  await pass(page);

  await page.goto("/akademiya/crypto#lesson/10");
  await page
    .getByRole("button", { name: "Sign with the bank’s private key" })
    .click();
  await page
    .getByRole("button", { name: "Verify with the public key" })
    .click();
  await expect(page.locator(".cb-card .nl-pass")).toContainText("Valid");
  await page
    .getByLabel("Message")
    .fill("Aliga 900 000 so‘m o‘tkazilsin. — Bank");
  await page
    .getByRole("button", { name: "Verify with the public key" })
    .click();
  await expect(page.locator(".cb-card .nl-fail")).toContainText("Invalid");
  await pass(page);
  await audit(page, "signature");
});

test("the lab is listed in the Academy catalog and shows in Uzbek", async ({
  page,
  context,
}) => {
  await page.goto("/akademiya");
  await expect(
    page.getByRole("heading", { level: 3, name: "Cryptography basics" }),
  ).toBeVisible();
  await context.addCookies([
    {
      name: "cybervalue-locale",
      value: "uz",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/akademiya/crypto#lesson/1");
  await expect(
    page.getByRole("heading", { level: 1, name: /Kriptografiya asoslari/ }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Kriptografiya asoslari/);
});
