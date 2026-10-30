import { ProgressSync } from "@/components/playground/ProgressSync";
import { Windows } from "@/components/playground/windows/Windows";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Windows basics · Academy Intermediate",
    "Tell standard from admin work, read NTFS permissions, trim a share’s access list, meet Active Directory and Group Policy, name five Security log events from one suspicious night and switch on Windows’ built-in defences.",
    "/intermediate/windows",
  );

export default async function WindowsPage() {
  await requireSection("intermediate", "windows");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/windows" />;
  return (
    <>
      <ProgressSync lab="windows" />
      <Windows />
    </>
  );
}
