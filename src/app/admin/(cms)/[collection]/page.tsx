import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { collections, isCollection } from "@/lib/site";
import { getAdminEntries } from "@/lib/content-write";
import {
  ADMIN_PAGE_SIZE,
  adminPageHref,
  parseAdminQuery,
} from "@/lib/admin-query";
import { resourceFileInfo } from "@/lib/stored-files";
import { formatDate } from "@/components/ui";
import { EntryActions } from "@/components/admin/entry-actions";

export default async function AdminCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  await requireAdmin(`/admin/${collection}`);
  const config = collections[collection];
  const query = parseAdminQuery(await searchParams);
  const db = getDb();
  const result = db
    ? await getAdminEntries(db, config.kind, query)
    : { entries: [], total: 0, pages: 1, page: 1 };
  const files = await Promise.all(
    result.entries.map((entry) =>
      entry.resource && db
        ? resourceFileInfo(db, entry.resource.filePath)
        : null,
    ),
  );
  const filtered = Boolean(query.q || query.status);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{config.title}</h1>
          <p className="muted">
            {result.total} {filtered ? "matching" : "total"} entries
          </p>
        </div>
        <Link
          href={`/admin/${collection}/new`}
          className="button button-primary"
        >
          New {config.singular.toLowerCase()}
        </Link>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          Database is not configured.
        </p>
      )}
      <form
        method="get"
        action={`/admin/${collection}`}
        className="admin-filters"
        key={`${query.q}:${query.status}:${query.sort}`}
      >
        <div className="admin-field admin-search-field">
          <label htmlFor="admin-query">
            Search {config.title.toLowerCase()}
          </label>
          <input
            id="admin-query"
            name="q"
            type="search"
            maxLength={120}
            defaultValue={query.q}
            placeholder={
              config.kind === "RESOURCE"
                ? "Title, slug, topic or type"
                : "Title, slug or summary"
            }
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="admin-status">Status</label>
          <select
            id="admin-status"
            name="status"
            defaultValue={query.status}
            className="admin-input"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="admin-sort">Sort by</label>
          <select
            id="admin-sort"
            name="sort"
            defaultValue={query.sort}
            className="admin-input"
          >
            <option value="updated">Recently updated</option>
            <option value="oldest">Oldest updated</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <button className="button button-secondary" type="submit">
          Apply
        </button>
        {(filtered || query.sort !== "updated") && (
          <Link
            href={`/admin/${collection}`}
            className="button button-secondary"
          >
            Reset
          </Link>
        )}
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption className="sr-only">{config.title} management</caption>
          <thead>
            <tr>
              <th scope="col">Title</th>
              {config.kind === "RESOURCE" && <th scope="col">Resource file</th>}
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.entries.map((entry, index) => {
              const file = files[index];
              return (
                <tr key={entry.id}>
                  <td>
                    <Link href={`/admin/${collection}/${entry.slug}`}>
                      {entry.title}
                    </Link>
                    <span className="admin-cell-detail">/{entry.slug}</span>
                    {entry.resource && (
                      <span className="admin-cell-detail">
                        {entry.resource.topic} · {entry.resource.type} ·{" "}
                        {entry.resource.version}
                      </span>
                    )}
                  </td>
                  {config.kind === "RESOURCE" && (
                    <td>
                      <span className="admin-file-path">
                        {entry.resource?.filePath ?? "No file attached"}
                      </span>
                      <span
                        className={`admin-cell-detail ${file?.status !== "Available" ? "admin-file-warning" : ""}`}
                      >
                        {file?.status ?? "Missing"}
                        {file?.size != null &&
                          ` · ${(file.size / 1024).toFixed(1)} KB`}
                      </span>
                    </td>
                  )}
                  <td>
                    <span
                      className={`admin-status admin-status-${entry.status.toLowerCase()}`}
                    >
                      {entry.status}
                    </span>
                    {entry.status === "PUBLISHED" &&
                      entry.publishedAt &&
                      entry.publishedAt > new Date() && (
                        <span className="admin-cell-detail">
                          Scheduled: {formatDate(entry.publishedAt)}
                        </span>
                      )}
                  </td>
                  <td>{formatDate(entry.updatedAt)}</td>
                  <td>
                    <EntryActions collection={collection} entry={entry} />
                  </td>
                </tr>
              );
            })}
            {result.entries.length === 0 && (
              <tr>
                <td
                  colSpan={config.kind === "RESOURCE" ? 5 : 4}
                  className="muted"
                >
                  {filtered
                    ? "No entries match these filters. Try another search or reset the filters."
                    : "Nothing here yet. Create your first entry to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {result.total > 0 && (
        <nav aria-label="Content pagination" className="admin-pagination">
          <span className="muted">
            {(result.page - 1) * ADMIN_PAGE_SIZE + 1}–
            {Math.min(result.page * ADMIN_PAGE_SIZE, result.total)} of{" "}
            {result.total} · Page {result.page} of {result.pages}
          </span>
          <div className="admin-row-actions">
            {result.page > 1 && (
              <Link
                className="button button-secondary"
                href={adminPageHref(collection, query, result.page - 1)}
              >
                Previous
              </Link>
            )}
            {result.page < result.pages && (
              <Link
                className="button button-secondary"
                href={adminPageHref(collection, query, result.page + 1)}
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
