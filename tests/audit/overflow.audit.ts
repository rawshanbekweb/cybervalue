// Finds content spilling out of its box on admin and public pages.
// Run: npx playwright test -c <config> tests/audit (not part of CI).
import { test, type Page } from "@playwright/test";
import { Client } from "pg";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const english = {
  cookies: [
    {
      name: "cybervalue-locale",
      value: process.env.AUDIT_LOCALE ?? "uz",
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
test.setTimeout(600_000);

async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > window.innerWidth + 1)
      out.push(
        `PAGE scrolls sideways: ${doc.scrollWidth} > ${window.innerWidth}`,
      );
    const describe = (el: Element) => {
      const cls = (el.getAttribute("class") || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .join(".");
      const text = (el.textContent || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 40);
      return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} "${text}"`;
    };
    const clips = (el: Element) => {
      const s = getComputedStyle(el);
      return ["auto", "scroll", "hidden", "clip"].includes(s.overflowX);
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        st.visibility !== "hidden" &&
        st.opacity !== "0"
      );
    };
    // Boxes: elements with a border or background. Every visible descendant
    // must stay inside, unless something in between scrolls or clips.
    const boxes = Array.from(
      document.querySelectorAll("main *, header *, footer *"),
    ).filter((box) => {
      const st = getComputedStyle(box);
      if (st.display === "inline" || st.position === "fixed" || clips(box))
        return false;
      const bordered =
        parseFloat(st.borderRightWidth) > 0 ||
        parseFloat(st.borderLeftWidth) > 0 ||
        st.backgroundColor !== "rgba(0, 0, 0, 0)";
      const r = box.getBoundingClientRect();
      return bordered && r.width >= 20 && r.height >= 10 && visible(box);
    });
    for (const box of boxes) {
      const r = box.getBoundingClientRect();
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) =>
          n !== box && clips(n as Element)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      });
      let node = walker.nextNode();
      while (node) {
        const el = node as Element;
        const st = getComputedStyle(el);
        if (
          st.position !== "absolute" &&
          st.position !== "fixed" &&
          visible(el)
        ) {
          const cr = el.getBoundingClientRect();
          // Off-canvas menus slide in from outside the viewport on purpose.
          if (cr.right <= 0 || cr.left >= window.innerWidth) {
            node = walker.nextNode();
            continue;
          }
          const over = Math.max(cr.right - r.right, r.left - cr.left, 0);
          if (over > 2) {
            out.push(
              `${describe(el)} spills out of ${describe(box)} by ${Math.round(over)}px`,
            );
            break;
          }
        }
        node = walker.nextNode();
      }
    }
    // Text wider than its own element (long words, nowrap).
    for (const el of Array.from(document.querySelectorAll("main *"))) {
      if (clips(el) || !visible(el)) continue;
      if (
        el.scrollWidth > el.clientWidth + 2 &&
        el.clientWidth > 0 &&
        getComputedStyle(el).display !== "inline"
      )
        out.push(
          `content wider than ${describe(el)} (${el.scrollWidth} > ${el.clientWidth})`,
        );
    }
    return [...new Set(out)].slice(0, 40);
  });
}

test("overflow audit", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL!;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const one = async (sql: string) =>
    (await client.query(sql)).rows[0]?.id as string | undefined;
  const ids = {
    student: await one(
      `SELECT id FROM "Student" ORDER BY "createdAt" DESC LIMIT 1`,
    ),
    junior: await one(
      `SELECT id FROM "JuniorMember" ORDER BY "createdAt" DESC LIMIT 1`,
    ),
    quiz: await one(
      `SELECT id FROM "StudentMaterial" WHERE kind='QUIZ' ORDER BY "createdAt" DESC LIMIT 1`,
    ),
    lab: await one(
      `SELECT id FROM "StudentMaterial" WHERE kind='CHALLENGE' ORDER BY "createdAt" DESC LIMIT 1`,
    ),
    exam: await one(
      `SELECT id FROM "HtmlExam" ORDER BY "createdAt" DESC LIMIT 1`,
    ),
    game: await one(
      `SELECT id FROM "LiveGame" ORDER BY "createdAt" DESC LIMIT 1`,
    ),
  };
  // A student and a Junior member with known codes, so their own pages can
  // be checked too.
  const newCode = (length: number) =>
    [...randomBytes(length)]
      .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
      .join("");
  const hash = (code: string) =>
    createHash("sha256").update(code).digest("hex");
  const studentCode = newCode(16);
  const juniorCode = newCode(8);
  const studentGroup =
    (
      await client.query(
        `SELECT "group" FROM "Student" WHERE "group" <> '' LIMIT 1`,
      )
    ).rows[0]?.group ?? "";
  await client.query(
    `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
     VALUES ($1, 'Audit Oquvchi Uzunfamiliyaliyev', $2, now(), $3)`,
    [`audit_${randomUUID()}`, studentGroup, hash(studentCode)],
  );
  await client.query(
    `INSERT INTO "JuniorMember" (id, name, "codeHash", progress, xp, "updatedAt")
     VALUES ($1, 'Audit Junior', $2, '{}', 0, now())`,
    [`audit_${randomUUID()}`, hash(juniorCode)],
  );
  await client.end();

  await page.goto("/admin/login");
  await page.locator('input[type="email"]').fill(email);
  await page
    .locator('input[type="password"]')
    .fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin$/);

  const admin = [
    "/admin",
    "/admin/settings",
    "/admin/class",
    "/admin/assignments",
    "/admin/live",
    "/admin/telegram",
    "/admin/users",
    "/admin/students",
    "/admin/junior",
    "/admin/materials",
    "/admin/materials/new",
    "/admin/materials/new?kind=QUIZ",
    "/admin/results",
    "/admin/assessments",
    "/admin/projects",
    "/admin/research",
    "/admin/labs",
    "/admin/ctf",
    "/admin/resources",
    "/admin/files",
    "/admin/portrait",
    "/admin/status",
    "/admin/errors",
    "/admin/audit",
    "/admin/account",
    ids.student && `/admin/students/${ids.student}`,
    ids.junior && `/admin/junior/${ids.junior}`,
    ids.quiz && `/admin/materials/${ids.quiz}`,
    ids.lab && `/admin/materials/${ids.lab}`,
    ids.exam && `/admin/assessments/${ids.exam}`,
    ids.game && `/admin/live/${ids.game}`,
  ].filter(Boolean) as string[];
  const pub = [
    "/",
    "/akademiya",
    "/junior",
    "/about",
    "/live",
    "/offline",
    "/student/login",
    "/akademiya/network-basics",
    "/akademiya/linux-basics",
    "/akademiya/html-basics",
    "/akademiya/web-security-lab",
    "/akademiya/ctf",
    "/akademiya/missions",
    "/akademiya/studio",
    "/akademiya/defend",
    "/resources",
    "/activity",
  ];
  // Signed-in learner pages, visited by fresh pages that share the cookie.
  const studentPage = await page.context().browser()!.newPage({
    storageState: english,
  });
  await studentPage.goto("/student/login");
  await studentPage.locator('input[name="code"]').fill(studentCode);
  await studentPage.locator('button[type="submit"]').click();
  await studentPage.waitForURL(/\/student$/, { timeout: 20_000 });
  const material = await studentPage
    .locator('a[href^="/student/m/"]')
    .first()
    .getAttribute("href")
    .catch(() => null);
  const juniorPage = await page.context().browser()!.newPage({
    storageState: english,
  });
  await juniorPage.goto("/junior");
  await juniorPage.locator('input[name="code"]').fill(juniorCode);
  await juniorPage.locator('button[type="submit"]').first().click();
  await juniorPage.locator(".jr-topbar").waitFor({ timeout: 20_000 });
  const visits: [Page, string][] = [
    ...[...admin, ...pub].map((path): [Page, string] => [page, path]),
    ...[
      "/student",
      "/student/certificate",
      ...(material ? [material] : []),
    ].map((path): [Page, string] => [studentPage, path]),
    ...[
      "/junior",
      "/junior/ciphers",
      "/junior/homework",
      "/junior/achievements",
      "/junior/secret",
    ].map((path): [Page, string] => [juniorPage, path]),
  ];
  const report: string[] = [];
  for (const width of [1280, 390]) {
    for (const p of [page, studentPage, juniorPage])
      await p.setViewportSize({ width, height: 900 });
    for (const [page, path] of visits) {
      const response = await page
        .goto(path, { waitUntil: "load", timeout: 30_000 })
        .catch(() => null);
      await page.waitForTimeout(400);
      if (!response) {
        report.push(`## ${width} ${path}: failed to load`);
        continue;
      }
      const found = await findOverflow(page);
      if (process.env.AUDIT_SHOTS)
        await page.screenshot({
          path: `${process.env.AUDIT_SHOTS}/${width}${path.replace(/[^a-z0-9]+/gi, "_")}.png`,
          fullPage: true,
        });
      if (found.length)
        report.push(
          `## ${width} ${path}\n${found.map((f) => `- ${f}`).join("\n")}`,
        );
      writeFileSync(
        process.env.AUDIT_OUT ?? "overflow-report.md",
        report.join("\n\n") + "\n",
      );
    }
  }
  writeFileSync(
    process.env.AUDIT_OUT ?? "overflow-report.md",
    report.join("\n\n") + "\n",
  );
});
