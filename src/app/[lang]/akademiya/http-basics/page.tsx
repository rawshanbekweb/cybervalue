import { ProgressSync } from "@/components/playground/ProgressSync";
import { HttpBasics } from "@/components/playground/http-basics/HttpBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTP basics · animated lab",
    "Watch the browser and the server talk: requests and responses, GET and POST, headers and every family of status codes, in animated lessons.",
    "/akademiya/http-basics",
  );

export default async function HttpBasicsPage() {
  await requireSection("academy", "httpbasics");
  return (
    <>
      <ProgressSync lab="httpbasics" />
      <HttpBasics />
    </>
  );
}
