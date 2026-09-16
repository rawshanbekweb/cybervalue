import { metadata } from "@/lib/seo";
import { Archive, type SearchParams } from "@/components/archive";
export const generateMetadata = () =>
  metadata(
    "Search the archive",
    "Find published projects, security labs, research, CTF writeups, and technical resources on CyberValue.",
    "/search",
    true,
  );
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="container page-content">
      <header className="page-header">
        <span className="eyebrow">Follow the thread</span>
        <h1>Search the archive.</h1>
        <p>One place to find the work, the questions, and the lessons.</p>
      </header>
      <Archive params={await searchParams} />
    </div>
  );
}
