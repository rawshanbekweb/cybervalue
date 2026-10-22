import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { collectionFor } from "@/lib/site";

type Hit = { href: string; title: string; detail: string };

// One search box for the whole admin: people, materials, assignments,
// live games and site content.
export default async function AdminSearchPage({
  searchParams,
}: PageProps<"/teacher/search">) {
  const t = await getAdminTranslator();
  const { scope } = await requireStaff("/teacher/search");
  const { q: raw } = await searchParams;
  const q = typeof raw === "string" ? raw.trim().slice(0, 80) : "";
  const db = getDb();
  const contains = { contains: q, mode: "insensitive" as const };
  const sections: { title: string; hits: Hit[] }[] = [];
  if (db && q.length >= 2) {
    const [students, juniors, kids, materials, assignments, games, content] =
      await Promise.all([
        db.student.findMany({
          where: {
            OR: [{ name: contains }, { group: contains }],
            ...groupWhere(scope),
          },
          take: 20,
          select: { id: true, name: true, group: true, active: true },
        }),
        db.juniorMember.findMany({
          where: {
            OR: [{ name: contains }, { group: contains }],
            ...groupWhere(scope),
          },
          take: 20,
          select: { id: true, name: true, group: true, active: true },
        }),
        db.kidsMember.findMany({
          where: {
            OR: [{ name: contains }, { group: contains }],
            ...groupWhere(scope),
          },
          take: 20,
          select: { id: true, name: true, group: true, active: true },
        }),
        db.studentMaterial.findMany({
          where: { OR: [{ title: contains }, { slug: contains }] },
          take: 20,
          select: { id: true, title: true, kind: true },
        }),
        db.studentAssignment.findMany({
          where: {
            OR: [{ title: contains }, { group: contains }],
            ...(scope.owner ? {} : { group: { in: ["", ...scope.groups] } }),
          },
          take: 20,
          select: { id: true, title: true, group: true },
        }),
        db.liveGame.findMany({
          where: { OR: [{ title: contains }, { code: contains }] },
          take: 20,
          select: { id: true, title: true, code: true },
        }),
        db.content.findMany({
          where: {
            OR: [{ title: contains }, { slug: contains }],
            // Site content is the owner's.
            ...(scope.owner ? {} : { id: "" }),
          },
          take: 20,
          select: { kind: true, slug: true, title: true, status: true },
        }),
      ]);
    const person = (
      rows: typeof students,
      base: string,
      label: string,
    ): Hit[] =>
      rows.map((r) => ({
        href: `${base}/${r.id}`,
        title: r.name,
        detail: [label, r.group, r.active ? "" : t("Blocked")]
          .filter(Boolean)
          .join(" · "),
      }));
    sections.push(
      {
        title: t("People"),
        hits: [
          ...person(students, "/teacher/students", t("Student")),
          ...person(juniors, "/teacher/junior", "Academy Junior"),
          ...person(kids, "/teacher/kids", "Academy Kids"),
        ],
      },
      {
        title: t("Student materials"),
        hits: materials.map((m) => ({
          href: `/teacher/materials/${m.id}`,
          title: m.title,
          detail: m.kind,
        })),
      },
      {
        title: t("Assignments"),
        hits: assignments.map((a) => ({
          href: "/teacher/assignments",
          title: a.title,
          detail: a.group || t("All groups"),
        })),
      },
      {
        title: t("Live quiz"),
        hits: games.map((g) => ({
          href: `/teacher/live/${g.id}`,
          title: g.title,
          detail: g.code,
        })),
      },
      {
        title: t("Site content"),
        hits: content.map((c) => ({
          href: `/admin/${collectionFor(c.kind)}/${c.slug}`,
          title: c.title,
          detail: `${c.kind} · ${c.status}`,
        })),
      },
    );
  }
  const total = sections.reduce((sum, s) => sum + s.hits.length, 0);
  return (
    <div className="admin-page">
      <h1>{t("Search")}</h1>
      <form method="get" className="admin-filters" role="search">
        <div className="admin-field admin-search-field">
          <label htmlFor="admin-search-q">
            {t("Name, group, title, code or slug")}
          </label>
          <input
            id="admin-search-q"
            name="q"
            type="search"
            className="admin-input"
            defaultValue={q}
            minLength={2}
            maxLength={80}
            autoFocus
          />
        </div>
        <button type="submit" className="button button-primary">
          {t("Search")}
        </button>
      </form>
      {q.length >= 2 && (
        <p className="muted" role="status">
          {t("{count} results for “{q}”", { count: total, q })}
        </p>
      )}
      {sections
        .filter((s) => s.hits.length)
        .map((s) => (
          <section key={s.title} className="admin-panel">
            <h2>{s.title}</h2>
            <ul className="admin-list">
              {s.hits.map((hit) => (
                <li key={hit.href + hit.title}>
                  <Link href={hit.href}>{hit.title}</Link>
                  <span className="muted">{hit.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
