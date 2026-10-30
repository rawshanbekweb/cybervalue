import { ProgressSync } from "@/components/playground/ProgressSync";
import { SearchTechnique } from "@/components/playground/search/Search";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Search technique · Academy Intermediate",
    "Learn what search engines miss, read and write site:, filetype:, intitle:, quoted and minus operators, narrow a search to one leaked file, date archived pages, judge sources, insist on independent confirmation and search in local languages and scripts.",
    "/intermediate/search",
  );

export default async function SearchPage() {
  await requireSection("intermediate", "search");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/search" />;
  return (
    <>
      <ProgressSync lab="search" />
      <SearchTechnique />
    </>
  );
}
