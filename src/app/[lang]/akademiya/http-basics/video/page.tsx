import { VideoLesson } from "@/components/playground/video-lesson/VideoLesson";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTP basics · video lesson",
    "A narrated, animated lesson in Uzbek: client and server, what is inside a request and a response, GET and POST, status codes and the Network panel.",
    "/akademiya/http-basics/video",
  );

export default async function HttpbasicsVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>;
}) {
  await requireSection("academy", "httpbasics");
  const { render } = await searchParams;
  return <VideoLesson id="httpbasics" render={render === "1"} />;
}
