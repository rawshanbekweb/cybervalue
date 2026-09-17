import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { collections, isCollection } from "@/lib/site";
import { getAdminEntries } from "@/lib/content-write";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { setStatusAction, deleteContentAction } from "./actions";

export default async function AdminCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  if (!isCollection(collection)) notFound();
  const config = collections[collection];
  const db = getDb();
  const entries = db ? await getAdminEntries(db, config.kind) : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{config.title}</h1>
        <Link
          href={`/admin/${collection}/new`}
          className="button button-primary"
        >
          New {config.singular.toLowerCase()}
        </Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <Link href={`/admin/${collection}/${entry.slug}`}>
                  {entry.title}
                </Link>
              </td>
              <td>{entry.status}</td>
              <td>{formatDate(entry.updatedAt)}</td>
              <td className="admin-row-actions">
                {entry.status !== "PUBLISHED" && (
                  <form
                    action={setStatusAction.bind(
                      null,
                      collection,
                      entry.id,
                      "PUBLISHED",
                    )}
                  >
                    <button type="submit" className="button button-secondary">
                      Publish
                    </button>
                  </form>
                )}
                {entry.status !== "ARCHIVED" && (
                  <form
                    action={setStatusAction.bind(
                      null,
                      collection,
                      entry.id,
                      "ARCHIVED",
                    )}
                  >
                    <button type="submit" className="button button-secondary">
                      Archive
                    </button>
                  </form>
                )}
                <form
                  action={deleteContentAction.bind(null, collection, entry.id)}
                >
                  <ConfirmButton
                    type="submit"
                    className="button button-secondary"
                    message={`Permanently delete "${entry.title}"? This cannot be undone.`}
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
