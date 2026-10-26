import { VideoLesson } from "@/components/playground/video-lesson/VideoLesson";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Bash basics · video lesson",
    "A narrated, animated lesson in Uzbek: what a script is, variables, quotes, arithmetic, for and while loops, if, arguments and a small security script.",
    "/akademiya/bash/video",
  );

export default async function BashVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>;
}) {
  await requireSection("academy", "bash");
  const { render } = await searchParams;
  return <VideoLesson id="bash" render={render === "1"} />;
}
