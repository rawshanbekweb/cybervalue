import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import {
  isTrashKind,
  purgeExpiredTrash,
  TRASH_DAYS,
  TRASH_KINDS,
  trashExpiry,
  trashWhere,
} from "@/lib/trash";
import {
  EmptyTrashButton,
  TrashItemButtons,
} from "@/components/admin/trash-buttons";

const KINDS: Record<string, string> = {
  student: "Student",
  junior: "Junior member",
  kids: "Kids member",
  material: "Student material",
  assignment: "Assignment",
  content: "Site entry",
};

const daysLeft = (deletedAt: Date) =>
  Math.max(
    0,
    Math.ceil((trashExpiry(deletedAt).getTime() - Date.now()) / 86_400_000),
  );

export default async function TrashPage({
  searchParams,
}: PageProps<"/admin/trash">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/admin/trash");
  const { kind: kindParam } = await searchParams;
  const kind = isTrashKind(kindParam) ? kindParam : "";
  const db = getDb();
  if (db) await purgeExpiredTrash(db);
  const where = { ...trashWhere(scope), ...(kind ? { kind } : {}) };
  const [items, total, people] = db
    ? await Promise.all([
        db.trashItem.findMany({
          where,
          orderBy: { deletedAt: "desc" },
          take: 200,
          select: {
            id: true,
            kind: true,
            label: true,
            group: true,
            deletedAt: true,
            deletedById: true,
          },
        }),
        db.trashItem.count({ where }),
        db.user.findMany({ select: { id: true, name: true } }),
      ])
    : [[], 0, []];
  const names = new Map(people.map((p) => [p.id, p.name]));
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Trash")}</h1>
          <p className="muted">
            {t(
              "Deleted students, members, materials, assignments and site entries stay here for {days} days with their answers and progress. Restore brings them back exactly as they were.",
              { days: TRASH_DAYS },
            )}
          </p>
        </div>
        {scope.owner && <EmptyTrashButton count={total} />}
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <nav className="admin-filters" aria-label={t("Filter by type")}>
        <Link
          href="/admin/trash"
          className={`admin-chip ${kind ? "" : "ok"}`}
          aria-current={kind ? undefined : "page"}
        >
          {t("All")}
        </Link>
        {TRASH_KINDS.filter((k) => scope.owner || k !== "content").map((k) => (
          <Link
            key={k}
            href={`/admin/trash?kind=${k}`}
            className={`admin-chip ${kind === k ? "ok" : ""}`}
            aria-current={kind === k ? "page" : undefined}
          >
            {t(KINDS[k])}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <p className="muted">{t("The trash is empty.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-trash-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Type")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Deleted")}</th>
                <th scope="col">{t("Days left")}</th>
                <th scope="col">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.label}</th>
                  <td>{t(KINDS[item.kind] ?? item.kind)}</td>
                  <td>{item.group || "—"}</td>
                  <td>
                    {formatDate(item.deletedAt, locale)}
                    {item.deletedById && names.has(item.deletedById) && (
                      <span className="admin-cell-detail">
                        {names.get(item.deletedById)}
                      </span>
                    )}
                  </td>
                  <td>{daysLeft(item.deletedAt)}</td>
                  <td>
                    <TrashItemButtons id={item.id} label={item.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > items.length && (
        <p className="muted">
          {t("Showing the latest {shown} of {total}.", {
            shown: items.length,
            total,
          })}
        </p>
      )}
    </div>
  );
}
