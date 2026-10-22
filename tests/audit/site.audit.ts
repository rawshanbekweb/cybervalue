// A whole-site health check: every public, learner and admin page on a phone
// and a laptop. For each visit it records the status, console and network
// errors, accessibility violations, sideways scrolling, small tap targets,
// load timings and page weight; then it checks every internal link found.
// Run: npx playwright test -c <config> tests/audit/site.audit.ts (not in CI).
// Writes AUDIT_OUT (default site-audit.json) and AUDIT_OUT.md.
import { test, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

test.setTimeout(3_600_000);

const LOCALE = process.env.AUDIT_LOCALE ?? "uz";
const state = {
  cookies: [
    {
      name: "cybervalue-locale",
      value: LOCALE,
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

type Visit = {
  who: string;
  path: string;
  width: number;
  status: number | null;
  errors: string[];
  failed: string[];
  axe: { id: string; impact: string; nodes: number; sample: string }[];
  overflow: string[];
  smallTargets: string[];
  timing: {
    ttfb: number;
    dcl: number;
    load: number;
    lcp: number;
    cls: number;
    requests: number;
    kb: number;
    jsKb: number;
    imgKb: number;
  } | null;
  bigImages: string[];
};

async function inspect(page: Page, mobile: boolean) {
  return page.evaluate(async (mobile) => {
    const lcp = await new Promise<number>((resolve) => {
      let value = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) value = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => resolve(value), 300);
    });
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
      }[])
        if (!e.hadRecentInput) cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    await new Promise((r) => setTimeout(r, 50));
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const res = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    const bytes = (list: PerformanceResourceTiming[]) =>
      list.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0);
    const describe = (el: Element) => {
      const cls = (el.getAttribute("class") || "").trim().split(/\s+/)[0];
      const text = (
        el.getAttribute("aria-label") ||
        el.textContent ||
        el.getAttribute("title") ||
        ""
      )
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 30);
      return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} "${text}"`;
    };
    const overflow: string[] = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > window.innerWidth + 1)
      overflow.push(`page scrolls sideways (${doc.scrollWidth}px)`);
    // Elements poking past the right edge of the screen.
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (
        r.width > 0 &&
        r.height > 0 &&
        st.visibility !== "hidden" &&
        st.position !== "fixed" &&
        r.right > window.innerWidth + 2 &&
        r.left < window.innerWidth
      ) {
        let clipped = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (["auto", "scroll", "hidden", "clip"].includes(ps.overflowX)) {
            clipped = true;
            break;
          }
        }
        if (!clipped)
          overflow.push(`${describe(el)} ends at ${Math.round(r.right)}px`);
      }
    }
    // WCAG 2.2 target size: controls at least 24×24 unless inline in text.
    const small: string[] = [];
    if (mobile)
      for (const el of Array.from(
        document.querySelectorAll(
          "button, a[href], input:not([type=hidden]), select, [role=button], summary",
        ),
      )) {
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (!r.width || !r.height || st.visibility === "hidden") continue;
        if (el.tagName === "A" && st.display === "inline") continue;
        if (r.width < 24 || r.height < 24)
          small.push(
            `${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`,
          );
      }
    const bigImages: string[] = [];
    for (const img of Array.from(document.images)) {
      const r = img.getBoundingClientRect();
      if (!r.width || !img.naturalWidth) continue;
      const ratio = img.naturalWidth / (r.width * devicePixelRatio);
      const entry = res.find((x) => x.name === img.currentSrc);
      const kb = entry
        ? (entry.transferSize || entry.encodedBodySize) / 1024
        : 0;
      if (ratio > 2 && kb > 40)
        bigImages.push(
          `${img.currentSrc.split("/").pop()?.slice(0, 50)} ${img.naturalWidth}px shown at ${Math.round(r.width)}px (${Math.round(kb)} KB)`,
        );
    }
    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((h) => h.startsWith(location.origin));
    return {
      timing: {
        ttfb: Math.round(nav.responseStart),
        dcl: Math.round(nav.domContentLoadedEventEnd),
        load: Math.round(nav.loadEventEnd),
        lcp: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000,
        requests: res.length + 1,
        kb: Math.round((bytes(res) + (nav.transferSize || 0)) / 1024),
        jsKb: Math.round(
          bytes(res.filter((r) => r.initiatorType === "script")) / 1024,
        ),
        imgKb: Math.round(
          bytes(
            res.filter(
              (r) =>
                r.initiatorType === "img" ||
                /\.(png|jpe?g|webp|avif|svg)/.test(r.name),
            ),
          ) / 1024,
        ),
      },
      overflow: [...new Set(overflow)].slice(0, 8),
      small: [...new Set(small)].slice(0, 12),
      bigImages,
      links,
    };
  }, mobile);
}

async function visit(
  page: Page,
  who: string,
  path: string,
  width: number,
  links: Set<string>,
): Promise<Visit> {
  const errors: string[] = [];
  const failed: string[] = [];
  const onConsole = (m: { type(): string; text(): string }) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  };
  const onError = (e: Error) =>
    errors.push(`pageerror: ${e.message.slice(0, 200)}`);
  const onResponse = (r: { status(): number; url(): string }) => {
    if (r.status() >= 400)
      failed.push(`${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, "")}`);
  };
  page.on("console", onConsole);
  page.on("pageerror", onError);
  page.on("response", onResponse);
  const result: Visit = {
    who,
    path,
    width,
    status: null,
    errors,
    failed,
    axe: [],
    overflow: [],
    smallTargets: [],
    timing: null,
    bigImages: [],
  };
  try {
    const response = await page.goto(path, {
      waitUntil: "load",
      timeout: 45_000,
    });
    result.status = response?.status() ?? null;
    await page.waitForTimeout(600);
    const info = await inspect(page, width < 600);
    result.timing = info.timing;
    result.overflow = info.overflow;
    result.smallTargets = info.small;
    result.bigImages = info.bigImages;
    info.links.forEach((l) => links.add(l.split("#")[0]));
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    result.axe = axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? "",
      nodes: v.nodes.length,
      sample: String(v.nodes[0]?.target ?? ""),
    }));
  } catch (error) {
    errors.push(`visit failed: ${String(error).slice(0, 200)}`);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onError);
    page.off("response", onResponse);
  }
  return result;
}

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const code = (n: number) =>
  [...randomBytes(n)].map((b) => ALPHABET[b & 31]).join("");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

async function learnerPage(browser: Browser) {
  const context = await browser.newContext({ storageState: state });
  return context.newPage();
}

test("site audit", async ({ page, browser }) => {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  const one = async (sql: string) =>
    (await db.query(sql)).rows[0] as Record<string, string> | undefined;
  const studentCode = code(16);
  const juniorCode = code(8);
  const kidsCode = code(8);
  const group =
    (await one(`SELECT "group" FROM "Student" WHERE "group" <> '' LIMIT 1`))
      ?.group ?? "";
  await db.query(
    `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
     VALUES ($1, 'Audit Oquvchi', $2, now(), $3)`,
    [`audit_${randomUUID()}`, group, hash(studentCode)],
  );
  await db.query(
    `INSERT INTO "JuniorMember" (id, name, "codeHash", progress, xp, "updatedAt")
     VALUES ($1, 'Audit Junior', $2, '{}', 0, now())`,
    [`audit_${randomUUID()}`, hash(juniorCode)],
  );
  await db.query(
    `INSERT INTO "KidsMember" (id, name, "codeHash", progress, xp, "updatedAt")
     VALUES ($1, 'Audit Kid', $2, '{}', 0, now())`,
    [`audit_${randomUUID()}`, hash(kidsCode)],
  );
  const ids = {
    student: (
      await one(`SELECT id FROM "Student" ORDER BY "createdAt" DESC LIMIT 1`)
    )?.id,
    junior: (
      await one(
        `SELECT id FROM "JuniorMember" ORDER BY "createdAt" DESC LIMIT 1`,
      )
    )?.id,
    kids: (
      await one(`SELECT id FROM "KidsMember" ORDER BY "createdAt" DESC LIMIT 1`)
    )?.id,
    material: (
      await one(
        `SELECT id FROM "StudentMaterial" ORDER BY "createdAt" DESC LIMIT 1`,
      )
    )?.id,
    report: (
      await one(
        `SELECT "reportToken" AS id FROM "Student" WHERE "reportToken" IS NOT NULL LIMIT 1`,
      )
    )?.id,
    certificate: (
      await one(`SELECT code AS id FROM "StudentCertificate" LIMIT 1`)
    )?.id,
  };
  const content = (
    await db.query(
      `SELECT kind, slug FROM "Content" WHERE status = 'PUBLISHED' ORDER BY "publishedAt" DESC LIMIT 6`,
    )
  ).rows as { kind: string; slug: string }[];
  await db.end();

  // Admin.
  await page.context().addCookies(state.cookies);
  await page.goto("/admin/login");
  await page.locator('input[type="email"]').fill(process.env.E2E_ADMIN_EMAIL!);
  await page
    .locator('input[type="password"]')
    .fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin$/);

  // Learners sign in with their codes, each in their own browser context.
  const student = await learnerPage(browser);
  await student.goto("/student/login");
  await student.locator('input[name="code"]').fill(studentCode);
  await student.locator('button[type="submit"]').click();
  await student.waitForURL(/\/student$/, { timeout: 20_000 });
  const material = await student
    .locator('a[href^="/student/m/"]')
    .first()
    .getAttribute("href", { timeout: 3000 })
    .catch(() => null);
  const junior = await learnerPage(browser);
  await junior.goto("/junior");
  await junior.locator('input[name="code"]').fill(juniorCode);
  await junior.locator('button[type="submit"]').first().click();
  await junior.locator(".jr-topbar").waitFor({ timeout: 20_000 });
  const kids = await learnerPage(browser);
  await kids.goto("/kids");
  await kids.locator('input[name="code"]').fill(kidsCode);
  await kids.locator('button[type="submit"]').first().click();
  await kids.waitForLoadState("networkidle");
  const visitor = await learnerPage(browser);

  const collectionPath: Record<string, string> = {
    PROJECT: "work",
    LAB: "labs",
    RESEARCH: "research",
    CTF: "ctf",
    RESOURCE: "resources",
  };
  const plan: [Page, string, string[]][] = [
    [
      visitor,
      "visitor",
      [
        "/",
        "/en",
        "/akademiya",
        "/akademiya/network-basics",
        "/akademiya/linux-basics",
        "/akademiya/html-basics",
        "/akademiya/html-basics/assessment",
        "/akademiya/web-security-lab",
        "/akademiya/ctf",
        "/akademiya/missions",
        "/akademiya/studio",
        "/akademiya/defend",
        "/junior",
        "/kids",
        "/about",
        "/activity",
        "/resources",
        "/work",
        "/labs",
        "/research",
        "/search?q=linux",
        "/live",
        "/offline",
        "/student/login",
        "/admin/login",
        "/this-page-does-not-exist",
        ...content.map((c) => `/${collectionPath[c.kind] ?? "work"}/${c.slug}`),
        ...(ids.report ? [`/report/${ids.report}`] : []),
        ...(ids.certificate ? [`/sertifikat/${ids.certificate}`] : []),
      ],
    ],
    [student, "student", ["/student", ...(material ? [material] : [])]],
    [
      junior,
      "junior",
      [
        "/junior",
        "/junior/ciphers",
        "/junior/homework",
        "/junior/achievements",
        "/junior/secret",
      ],
    ],
    [
      kids,
      "kids",
      [
        "/kids",
        "/kids/kosmos",
        "/kids/robot",
        "/kids/ilon",
        "/kids/sertifikat",
      ],
    ],
    [
      page,
      "admin",
      [
        "/admin",
        "/teacher/analytics",
        "/teacher/class",
        "/teacher/assignments",
        "/teacher/live",
        "/teacher/groups",
        "/admin/users",
        "/teacher/students",
        "/teacher/kids",
        "/teacher/junior",
        "/teacher/materials",
        "/teacher/results",
        "/teacher/assessments",
        "/admin/telegram",
        "/admin/projects",
        "/admin/files",
        "/admin/settings",
        "/admin/status",
        "/admin/errors",
        "/admin/cleanup",
        "/teacher/trash",
        "/admin/team",
        "/admin/audit",
        "/admin/account",
        "/teacher/search?q=a",
        ...(ids.student ? [`/teacher/students/${ids.student}`] : []),
        ...(ids.junior ? [`/teacher/junior/${ids.junior}`] : []),
        ...(ids.kids ? [`/teacher/kids/${ids.kids}`] : []),
        ...(ids.material ? [`/teacher/materials/${ids.material}`] : []),
      ],
    ],
  ];

  const links = new Set<string>();
  const visits: Visit[] = [];
  const out = process.env.AUDIT_OUT ?? "site-audit.json";
  for (const width of [390, 1280]) {
    for (const [p] of plan) await p.setViewportSize({ width, height: 860 });
    for (const [p, who, paths] of plan)
      for (const path of paths) {
        visits.push(await visit(p, who, path, width, links));
        writeFileSync(out, JSON.stringify({ visits }, null, 1));
      }
  }

  // Every internal link found on the way, fetched once as a visitor.
  const broken: { url: string; status: number; from: string }[] = [];
  for (const url of links) {
    if (/\/admin|\/student\/logout|\/api\//.test(url)) continue;
    const response = await visitor.request
      .get(url, { maxRedirects: 5, timeout: 30_000 })
      .catch(() => null);
    const status = response?.status() ?? 0;
    if (status >= 400 || status === 0)
      broken.push({
        url: url.replace(/^https?:\/\/[^/]+/, ""),
        status,
        from: "",
      });
  }
  writeFileSync(
    out,
    JSON.stringify({ visits, broken, linksChecked: links.size }, null, 1),
  );

  // A readable summary.
  const md: string[] = ["# Site audit", ""];
  const by = <T>(list: T[], key: (x: T) => string) => {
    const m = new Map<string, T[]>();
    for (const x of list) m.set(key(x), [...(m.get(key(x)) ?? []), x]);
    return m;
  };
  md.push(
    "## Pages",
    "",
    "| who | path | w | status | LCP | CLS | KB | JS KB | axe | errors |",
    "|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const v of visits)
    md.push(
      `| ${v.who} | ${v.path} | ${v.width} | ${v.status} | ${v.timing?.lcp ?? "-"} | ${v.timing?.cls ?? "-"} | ${v.timing?.kb ?? "-"} | ${v.timing?.jsKb ?? "-"} | ${v.axe.length} | ${v.errors.length + v.failed.length} |`,
    );
  md.push("", "## Accessibility (axe)", "");
  for (const [id, list] of by(
    visits.flatMap((v) =>
      v.axe.map((a) => ({ ...a, where: `${v.width} ${v.path}` })),
    ),
    (a) => a.id,
  ))
    md.push(
      `- **${id}** (${list[0].impact}) on ${list.length} visits: ${[...new Set(list.map((a) => a.where))].slice(0, 6).join(", ")} — e.g. \`${list[0].sample}\``,
    );
  md.push("", "## Console and network errors", "");
  for (const v of visits)
    for (const e of [...v.errors, ...v.failed])
      md.push(`- ${v.width} ${v.path}: ${e}`);
  md.push("", "## Sideways overflow", "");
  for (const v of visits)
    for (const o of v.overflow) md.push(`- ${v.width} ${v.path}: ${o}`);
  md.push("", "## Small tap targets (phone)", "");
  for (const v of visits)
    if (v.smallTargets.length)
      md.push(`- ${v.path}: ${v.smallTargets.join("; ")}`);
  md.push("", "## Oversized images", "");
  for (const v of visits)
    for (const i of v.bigImages) md.push(`- ${v.width} ${v.path}: ${i}`);
  md.push("", `## Broken links (${broken.length} of ${links.size})`, "");
  for (const b of broken) md.push(`- ${b.status} ${b.url}`);
  writeFileSync(`${out}.md`, md.join("\n") + "\n");
});
