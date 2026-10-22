import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner, roleOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { listGroups } from "@/lib/admin/groups";
import { CreateStaffForm, StaffEditForm } from "@/components/admin/team-forms";

export default async function TeamPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const session = await requireOwner("/admin/team");
  const db = getDb();
  const [people, groups] = db
    ? await Promise.all([
        db.user.findMany({
          orderBy: [{ role: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            groups: true,
            active: true,
            totpSecret: true,
            createdAt: true,
            adminEvents: {
              where: { action: "login.success" },
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        }),
        listGroups(db),
      ])
    : [[], []];
  const groupNames = groups.map((g) => g.name);
  const owner = roleOf(session.user) === "owner";
  const label = { owner: t("Owner"), admin: t("Admin"), teacher: t("Teacher") };
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Team")}</h1>
          <p className="muted">
            {t(
              "Who can sign in. Admins run the site from /admin; teachers work in /teacher with the groups you give them. Only an owner manages owners and admins.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <CreateStaffForm groups={groupNames} owner={owner} />
      <div className="admin-team">
        {people.map((person) => (
          <details
            key={person.id}
            className="admin-details admin-team-row"
            data-email={person.email ?? ""}
          >
            <summary>
              <strong>{person.name}</strong>
              <span className="muted">{person.email}</span>
              <span className="admin-chip">{label[roleOf(person)]}</span>
              {person.role === "teacher" && (
                <span className="muted">{person.groups.join(", ") || "—"}</span>
              )}
              {!person.active && (
                <strong className="admin-warn">{t("Switched off")}</strong>
              )}
              {person.id === session.user.id && (
                <span className="muted">{t("(you)")}</span>
              )}
              <span className="admin-cell-detail">
                {person.totpSecret ? t("2FA on") : t("2FA off")} ·{" "}
                {person.adminEvents[0]
                  ? t("Last sign-in {date}", {
                      date: formatDate(person.adminEvents[0].createdAt, locale),
                    })
                  : t("Never signed in")}
              </span>
            </summary>
            {owner || roleOf(person) === "teacher" ? (
              <StaffEditForm
                id={person.id}
                owner={owner}
                name={person.name}
                role={person.role}
                groups={person.groups}
                active={person.active}
                allGroups={groupNames}
                self={person.id === session.user.id}
              />
            ) : (
              <p className="muted">
                {t("Only an owner can manage owners and admins.")}
              </p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
