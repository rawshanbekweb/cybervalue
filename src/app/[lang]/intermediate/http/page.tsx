import { ProgressSync } from "@/components/playground/ProgressSync";
import { HttpLab } from "@/components/playground/http-lab/HttpLab";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTP in depth · Academy Intermediate",
    "Write raw requests to a training server, follow redirects, sign in with cookies, and learn the same-origin policy, CORS and security headers.",
    "/intermediate/http",
  );

export default async function HttpPage() {
  await requireSection("intermediate", "http");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/http" />;
  return (
    <>
      <ProgressSync lab="http" />
      <HttpLab />
    </>
  );
}
