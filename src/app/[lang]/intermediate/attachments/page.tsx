import { ProgressSync } from "@/components/playground/ProgressSync";
import { Attachments } from "@/components/playground/attachments/Attachments";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Opening attachments safely · Academy Intermediate",
    "Tell data files from runnable ones, see through double extensions, refuse macros, spot password archives and disk images, and open files read-only.",
    "/intermediate/attachments",
  );

export default async function AttachmentsPage() {
  await requireSection("intermediate", "attachments");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/attachments" />
    );
  return (
    <>
      <ProgressSync lab="attachments" />
      <Attachments />
    </>
  );
}
