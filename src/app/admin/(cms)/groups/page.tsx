import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listGroups } from "@/lib/admin/groups";
import { GroupForms } from "@/components/admin/group-forms";

const q = (group: string) => `?group=${encodeURIComponent(group)}`;

export default async function GroupsPage() {
  const t = await getAdminTranslator();
  const { scope } = await requireStaff("/admin/groups");
  const db = getDb();
  const [groups, teachers] = db
    ? await Promise.all([
        listGroups(db, scope.owner ? undefined : scope.groups),
        scope.owner
          ? db.user.findMany({
              where: { role: "teacher" },
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            })
          : [],
      ])
    : [[], []];
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Groups")}</h1>
          <p className="muted">
            {scope.owner
              ? t(
                  "Every group with its people and teachers. A group appears as soon as someone is added to it.",
                )
              : t("The groups you teach.")}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      {groups.length === 0 ? (
        <p className="muted">{t("No groups yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Students")}</th>
                <th scope="col">Junior</th>
                <th scope="col">Kids</th>
                <th scope="col">{t("Teachers")}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.name}>
                  <th scope="row">
                    <Link href={`/admin/class${q(g.name)}`}>{g.name}</Link>
                  </th>
                  <td>
                    <Link href={`/admin/students${q(g.name)}`}>
                      {g.students}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin/junior${q(g.name)}`}>{g.junior}</Link>
                  </td>
                  <td>
                    <Link href={`/admin/kids${q(g.name)}`}>{g.kids}</Link>
                  </td>
                  <td>{g.teachers.map((x) => x.name).join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {scope.owner && groups.length > 0 && (
        <section className="admin-team">
          <h2>{t("Manage groups")}</h2>
          {groups.map((g) => (
            <details key={g.name} className="admin-details">
              <summary>{g.name}</summary>
              <GroupForms
                group={g.name}
                teachers={teachers}
                assigned={g.teachers.map((x) => x.id)}
              />
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
