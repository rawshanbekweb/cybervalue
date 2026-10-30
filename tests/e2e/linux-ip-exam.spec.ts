import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ANSWERS: [string, number][] = [
  ["l1", 1],
  ["l2", 2],
  ["l3", 3],
  ["l4", 0],
  ["l5", 3],
  ["l6", 1],
  ["l7", 2],
  ["l8", 0],
  ["l9", 1],
  ["l10", 3],
  ["l11", 1],
  ["l12", 0],
  ["l13", 2],
  ["l14", 2],
  ["l15", 1],
  ["l16", 2],
  ["l17", 3],
  ["l18", 0],
  ["l19", 1],
  ["l20", 2],
  ["n1", 1],
  ["n2", 2],
  ["n3", 1],
  ["n4", 3],
  ["n5", 1],
  ["n6", 0],
  ["n7", 2],
  ["n8", 1],
  ["n9", 2],
  ["n10", 3],
  ["n11", 1],
  ["n12", 1],
  ["n13", 1],
  ["n14", 2],
  ["n15", 1],
  ["n16", 2],
  ["n17", 3],
  ["n18", 2],
  ["n19", 0],
  ["n20", 3],
];

// Headless Chromium enters and leaves full screen on its own, which blurs the
// window; the guard's logic is tested by dispatching the events directly.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.resolve();
  });
});

test("Resources links to the Linux and IP exam", async ({ page }) => {
  await page.goto("/resources");
  await page
    .getByRole("link", { name: "Linux va IP imtihonini boshlash" })
    .click();
  await expect(page).toHaveURL(/\/resources\/linux-ip-exam$/);
  await expect(
    page.getByRole("heading", { name: /Linux va IP manzil imtihoni/ }),
  ).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();
});

test("the exam guards itself and grades 100 for a perfect paper", async ({
  page,
}) => {
  await page.goto("/resources/linux-ip-exam");
  await page.getByRole("button", { name: "Imtihonni boshlash" }).click();
  await expect(page.getByRole("timer")).toHaveText(/^[12]:\d\d:\d\d$/);

  // Copy, paste and the context menu are cancelled.
  const blocked = await page.evaluate(() =>
    ["copy", "paste", "contextmenu"].map(
      (type) =>
        !document.dispatchEvent(
          new Event(type, { bubbles: true, cancelable: true }),
        ),
    ),
  );
  expect(blocked).toEqual([true, true, true]);
  await expect(page.locator(".lip-guard")).toHaveCSS("user-select", "none");

  // Leaving the window hides the questions and is counted (after the
  // moment of switching to full screen, which doesn't count).
  await page.waitForTimeout(1700);
  await page.evaluate(() => {
    document.hasFocus = () => false;
    window.dispatchEvent(new Event("blur"));
  });
  await expect(
    page.getByRole("alertdialog").getByText("Siz imtihon oynasidan chiqdingiz"),
  ).toBeVisible();
  await expect(page.locator(".lip-body")).toBeHidden();
  await page.evaluate(() => {
    document.hasFocus = () => true;
  });
  await page.getByRole("button", { name: "Imtihonga qaytish" }).click();
  await page.waitForTimeout(1700);
  await expect(page.locator(".lip-leaves")).toContainText(
    /oynadan chiqish: [1-9]/,
  );

  for (const [id, index] of ANSWERS)
    await page.locator(`input[name="${id}"]`).nth(index).check();
  const opens: [string, string][] = [
    ["o1", "tail -n 5 /etc/passwd"],
    ["o2", "30"],
    ["o3", "chmod 750 script.sh"],
    ["o4", 'grep -c "Failed password" /var/log/auth.log'],
    ["o5", "172.16.32.0"],
    ["o6", "192.168.1.95"],
    ["o7", "2001:db8::ff00:42:8329"],
    ["o8", "/22"],
    ["o9", "ss -tlnp | grep 8080"],
    ["o10", 'find . -name "*.log" -mtime +7 -delete'],
  ];
  for (const [id, value] of opens)
    await page.locator(`#lip-in-${id}`).fill(value);
  await expect(page.getByText("50 / 50 javob berildi")).toBeVisible();

  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);

  await page.getByRole("button", { name: "Topshirish" }).click();
  await page.getByRole("button", { name: "Ha, topshirish" }).click();
  await expect(page.getByText("NATIJA", { exact: true })).toBeVisible();
  await expect(page.locator(".rx-score")).toContainText("100 / 100");
  await expect(page.locator(".rx-review.rx-bad")).toHaveCount(0);
});

test("a blank paper scores zero and shows the answers", async ({ page }) => {
  await page.goto("/resources/linux-ip-exam");
  await page.getByRole("button", { name: "Imtihonni boshlash" }).click();
  await page.locator('input[name="l1"]').nth(0).check();
  await page.getByRole("button", { name: "Topshirish" }).click();
  await page.getByRole("button", { name: "Ha, topshirish" }).click();
  await expect(page.locator(".rx-score")).toContainText("0 / 100");
  await expect(page.getByText("Namuna javob:").first()).toBeVisible();
  await expect(page.getByText("To‘g‘ri javob:").first()).toBeVisible();
});
