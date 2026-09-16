import Link from "next/link";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { searchContent, getFacets } from "@/lib/content";
import { collections, type Collection } from "@/lib/site";
import { parseFilters, filterSchema, type Filters } from "@/lib/validation";
import { EmptyState, EntryCard } from "./ui";

export type SearchParams = Record<string, string | string[] | undefined>;
export async function Archive({
  collection,
  params,
}: {
  collection?: Collection;
  params: SearchParams;
}) {
  const parsed = parseFilters(params);
  const filters = parsed.success ? parsed.data : filterSchema.parse({});
  const kind = collection ? collections[collection].kind : undefined;
  const [result, facets] = await Promise.all([
    searchContent(filters, kind),
    getFacets(kind),
  ]);
  const path = collection ? `/${collection}` : "/search";
  const filtered = Object.entries(filters).some(([k, v]) =>
    k === "page" ? v !== 1 : !!v,
  );
  function pageHref(page: number) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== "page" && value) query.set(key, String(value));
    });
    if (page > 1) query.set("page", String(page));
    return `${path}${query.size ? `?${query}` : ""}`;
  }
  return (
    <>
      <form
        action={path}
        className="filters"
        role="search"
        aria-label={
          collection
            ? `Filter ${collections[collection].title}`
            : "Search all content"
        }
      >
        <label>
          Search
          <input
            type="search"
            name="q"
            placeholder={
              collection
                ? `Search ${collections[collection].title.toLowerCase()}…`
                : "Search the whole archive…"
            }
            defaultValue={filters.q}
            maxLength={120}
          />
        </label>
        {facets.categories.length > 0 && (
          <label>
            Category
            <select name="category" defaultValue={filters.category}>
              <option value="">All categories</option>
              {facets.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {facets.tags.length > 0 && (
          <label>
            Topic
            <select name="tag" defaultValue={filters.tag}>
              <option value="">All topics</option>
              {facets.tags.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {facets.technologies.length > 0 && (
          <label>
            Technology
            <select name="technology" defaultValue={filters.technology}>
              <option value="">All technologies</option>
              {facets.technologies.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
        {facets.years.length > 0 && (
          <label>
            Year
            <select name="year" defaultValue={filters.year}>
              <option value="">All years</option>
              {facets.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
        {collection === "labs" && (
          <label>
            Difficulty
            <select name="difficulty" defaultValue={filters.difficulty}>
              <option value="">All levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
        )}
        <button className="button button-primary" type="submit">
          <Search size={15} />
          Search
        </button>
        {filtered && (
          <Link className="button button-secondary" href={path}>
            Clear
          </Link>
        )}
      </form>
      {!parsed.success && (
        <p role="alert" className="filter-error">
          Some filters were invalid. Showing the archive with default filters.
        </p>
      )}
      <div className="results-label">
        <span>
          {result.total} published {result.total === 1 ? "entry" : "entries"}
          {filters.q ? ` matching “${filters.q}”` : ""}
        </span>
        <span>Latest first</span>
      </div>
      {result.items.length ? (
        <div className="entry-grid">
          {result.items.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : collection ? (
        <EmptyState collection={collection} filtered={filtered} />
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={25} />
          </div>
          <h2>
            {filtered
              ? "No matching entries."
              : "The archive is just getting started."}
          </h2>
          <p>
            {filtered
              ? "Try different keywords or clear your filters."
              : "Search will cover every published project, lab, research article, CTF record, and resource."}
          </p>
          <Link className="text-link" href={filtered ? "/search" : "/about"}>
            {filtered ? "Clear search" : "About CyberValue"}
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <Pagination filters={filters} total={result.total} href={pageHref} />
    </>
  );
}
function Pagination({
  filters,
  total,
  href,
}: {
  filters: Filters;
  total: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / 12));
  return pages > 1 || filters.page > 1 ? (
    <nav aria-label="Pagination" className="pagination">
      {filters.page > 1 && (
        <Link
          className="text-link"
          href={href(Math.min(pages, filters.page - 1))}
        >
          <ArrowLeft size={14} />
          Previous
        </Link>
      )}
      <span>
        Page {filters.page} of {pages}
      </span>
      {filters.page < pages && (
        <Link className="text-link" href={href(filters.page + 1)}>
          Next
          <ArrowRight size={14} />
        </Link>
      )}
    </nav>
  ) : null;
}
