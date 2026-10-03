import { test, expect } from "@playwright/test";

test("Resources links to the exam, which can be taken and graded end to end", async ({
  page,
}) => {
  await page.goto("/resources");
  await page.getByRole("link", { name: "Imtihonni boshlash" }).click();
  await expect(page).toHaveURL(/\/resources\/exam$/);
  await page.getByRole("button", { name: "Imtihonni boshlash" }).click();

  await page
    .getByRole("group", { name: /Shell qanday vazifani bajaradi/ })
    .getByLabel(/vositachi/)
    .check();
  await page.getByLabel(/oxirgi odatdagi host manzili/i).fill("192.168.1.126");
  await page
    .getByLabel(/\/var\/log katalogiga mutlaq yo‘l/)
    .fill("cd /var/log");

  await page.getByRole("button", { name: "Topshirish" }).click();
  await page.getByRole("button", { name: "Ha, topshirish" }).click();
  await expect(page.getByText("NATIJA")).toBeVisible();
  await expect(page.getByText("7 / 100")).toBeVisible();
  await expect(page.getByText("To‘g‘ri javob:").first()).toBeVisible();
});
