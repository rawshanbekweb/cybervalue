import { ProgressSync } from "@/components/playground/ProgressSync";
import { HttpLab } from "@/components/playground/http-lab/HttpLab";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTP in depth · Academy Intermediate",
    "Write raw requests to a training server, follow redirects, sign in with cookies, and learn the same-origin policy, CORS and security headers.",
    "/akademiya/http",
  );

export default async function HttpPage() {
  await requireSection("academy", "http");
  return (
    <>
      <ProgressSync lab="http" />
      <HttpLab />
    </>
  );
}
