import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container error-page">
      <span className="eyebrow">404 / Outside the archive</span>
      <h1>This trail ends here.</h1>
      <p>
        The page may have moved, or the entry is not published. There is still
        plenty of room to explore.
      </p>
      <Link className="button button-primary" href="/">
        Back to overview ↗
      </Link>
      <Link className="button button-secondary" href="/search">
        Search the archive
      </Link>
    </div>
  );
}
