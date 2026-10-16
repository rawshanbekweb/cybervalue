import { requireSection } from "@/lib/site-config-server";
import { HtmlBasics } from "@/components/playground/html-basics/HtmlBasics";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "HTML Basics",
    "12 short HTML exercises: practice directly in the browser with a code editor and a live preview.",
    "/playground/html-basics",
  );

export default async function HtmlBasicsPage() {
  await requireSection("academy", "html");
  return <HtmlBasics />;
}
