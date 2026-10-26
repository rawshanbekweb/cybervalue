import { VideoLesson } from "@/components/playground/video-lesson/VideoLesson";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "HTTPS and TLS · video lesson",
    "A narrated, animated lesson in Uzbek: open Wi-Fi, encryption and keys, the TLS handshake, what HTTPS hides, certificates, the chain of trust and browser warnings.",
    "/akademiya/https/video",
  );

export default async function HttpsVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>;
}) {
  await requireSection("academy", "https");
  const { render } = await searchParams;
  return <VideoLesson id="https" render={render === "1"} />;
}
