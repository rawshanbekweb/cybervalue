import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
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

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test("the week's hero and the week's CTF show for the group", async ({
  page,
  browser,
}) => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );
  const id = Date.now().toString(36);
  const group = `w-${id}`;
  const code = [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");
  const [me, rival] = [`e2e_${randomUUID()}`, `e2e_${randomUUID()}`];
  const [lesson, ctf] = [`e2e_${randomUUID()}`, `e2e_${randomUUID()}`];
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash") VALUES
       ($1, 'Zarina Aliyeva', $3, now(), $4),
       ($2, 'Bobur Karimov', $3, now(), $5)`,
    [
      me,
      rival,
      group,
      createHash("sha256").update(code).digest("hex"),
      createHash("sha256").update(randomUUID()).digest("hex"),
    ],
  );
  await client.query(
    `INSERT INTO "StudentMaterial" (id, slug, kind, title, groups, published, secret, "updatedAt") VALUES
       ($1, $3, 'LESSON', $5, $7, true, NULL, now()),
       ($2, $4, 'CHALLENGE', $6, $7, true, 'e2e-secret', now())`,
    [
      lesson,
      ctf,
      `e2e-week-${id}`,
      `e2e-ctf-${id}`,
      `Week lesson ${id}`,
      `Log hunt ${id}`,
      [group],
    ],
  );
  // The rival finished the lesson and solved the CTF this week.
  await client.query(
    `INSERT INTO "StudentProgress" ("studentId", "materialId") VALUES ($1, $2), ($1, $3)`,
    [rival, lesson, ctf],
  );
  await client.end();

  const student = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await student.goto("/student/login");
  await student.getByLabel("Access code").fill(code);
  await student.getByRole("button", { name: "Enter" }).click();
  await expect(student).toHaveURL(/\/student$/);
  const heroes = student.locator(".student-heroes");
  await expect(heroes.locator("li").first()).toContainText("Bobur K.");
  await expect(heroes.locator("li").first()).toContainText("+120 XP");
  await expect(student.getByText("You this week: +0 XP")).toBeVisible();
  const weekly = student.locator(".student-weekly-ctf");
  await expect(weekly).toContainText(`Log hunt ${id}`);
  await expect(weekly).toContainText("1 in your group already solved it.");
  await student.context().close();

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/class?group=${group}`);
  const card = page.locator(".admin-card", { hasText: "Hero of the week" });
  await expect(card).toContainText("Bobur Karimov");
  await expect(card).toContainText("+120 XP since Monday");
});
