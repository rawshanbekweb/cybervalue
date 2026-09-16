"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container error-page">
      <span className="eyebrow">Something interrupted the request</span>
      <h1>Let’s try that again.</h1>
      <p>The page could not be loaded. Please try again in a moment.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
      <Link className="button button-secondary" href="/">
        Back to overview
      </Link>
    </div>
  );
}
