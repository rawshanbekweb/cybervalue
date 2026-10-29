import { ProgressSync } from "@/components/playground/ProgressSync";
import { FileSystems } from "@/components/playground/filesystem/FileSystem";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "File systems · Academy Intermediate",
    "Read stat output, work out which MACB timestamps an action changes, see why deleted files survive, recognise files by their first bytes, and build an attack timeline from sources in different time zones.",
    "/intermediate/filesystem",
  );

export default async function FileSystemPage() {
  await requireSection("intermediate", "filesystem");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/filesystem" />
    );
  return (
    <>
      <ProgressSync lab="filesystem" />
      <FileSystems />
    </>
  );
}
