import { ProgressSync } from "@/components/playground/ProgressSync";
import { Containers } from "@/components/playground/containers/Containers";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Containers · Academy Intermediate",
    "Review a Dockerfile, keep secrets out of image layers, run as a non-root user with trimmed privileges, scan images for known vulnerabilities and use only trusted, signed images.",
    "/intermediate/containers",
  );

export default async function ContainersPage() {
  await requireSection("intermediate", "containers");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/containers" />
    );
  return (
    <>
      <ProgressSync lab="containers" />
      <Containers />
    </>
  );
}
