import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { storedFileSelect } from "@/lib/stored-files";
import { parseAdminQuery } from "@/lib/admin-query";
import { FileLibrary } from "@/components/admin/file-library";
import { MAX_STORAGE_BYTES } from "@/lib/upload-validation";

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("/admin/files");
  const db = getDb();
  if (!db) return <p className="admin-error">Storage is unavailable.</p>;
  const params = await searchParams;
  const query = parseAdminQuery(params);
  const kind =
    params.kind === "IMAGE" || params.kind === "RESOURCE"
      ? params.kind
      : undefined;
  const where = {
    ...(kind ? { kind } : {}),
    ...(query.q
      ? { name: { contains: query.q, mode: "insensitive" as const } }
      : {}),
  };
  const [total, usage] = await Promise.all([
    db.storedFile.count({ where }),
    db.storedFile.aggregate({ _sum: { size: true }, _count: true }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 24));
  const page = Math.min(query.page, pages);
  const files = await db.storedFile.findMany({
    where,
    select: storedFileSelect,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 24,
    skip: (page - 1) * 24,
  });
  function href(value: number) {
    return `/admin/files?${new URLSearchParams({ q: query.q, kind: kind ?? "", page: String(value) })}`;
  }
  return (
    <div className="admin-page">
      <h1>File library</h1>
      <p className="muted">
        {usage._count} uploaded files ·{" "}
        {((usage._sum.size ?? 0) / 1024 / 1024).toFixed(1)} /{" "}
        {MAX_STORAGE_BYTES / 1024 / 1024} MiB used
      </p>
      <p className="admin-help">
        Uploads remain private until attached to published content. Files used
        by any entry cannot be deleted.
      </p>
      <form method="get" className="admin-filters" key={`${query.q}:${kind}`}>
        <div className="admin-field admin-search-field">
          <label htmlFor="file-query">Search files</label>
          <input
            id="file-query"
            name="q"
            type="search"
            defaultValue={query.q}
            maxLength={120}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="file-kind">File type</label>
          <select
            id="file-kind"
            name="kind"
            defaultValue={kind ?? ""}
            className="admin-input"
          >
            <option value="">All files</option>
            <option value="RESOURCE">Resources</option>
            <option value="IMAGE">Images</option>
          </select>
        </div>
        <button className="button button-secondary">Apply</button>
      </form>
      <FileLibrary files={files} />
      {pages > 1 && (
        <nav className="admin-pagination" aria-label="File pagination">
          <span>
            Page {page} of {pages}
          </span>
          {page > 1 && <Link href={href(page - 1)}>Previous</Link>}
          {page < pages && <Link href={href(page + 1)}>Next</Link>}
        </nav>
      )}
    </div>
  );
}
