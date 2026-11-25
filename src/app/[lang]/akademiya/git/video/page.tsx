import { VideoLesson } from "@/components/playground/video-lesson/VideoLesson";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Git and GitHub · video lesson",
    "A narrated, animated lesson in Uzbek: why version control, the first commit, history, branches, merge conflicts, GitHub, teamwork and keeping secrets out of history — with real screenshots.",
    "/akademiya/git/video",
  );

export default async function GitVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>;
}) {
  await requireSection("academy", "git");
  const { render } = await searchParams;
  return <VideoLesson id="git" render={render === "1"} />;
}
