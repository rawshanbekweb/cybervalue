import { VideoLesson } from "@/components/playground/video-lesson/VideoLesson";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Cryptography basics · video lesson",
    "A narrated, animated lesson in Uzbek: bytes and Base64, hashes and file checks, salt and dictionary attacks, XOR, key length and digital signatures.",
    "/akademiya/crypto/video",
  );

export default async function CryptoVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>;
}) {
  await requireSection("academy", "crypto");
  const { render } = await searchParams;
  return <VideoLesson id="crypto" render={render === "1"} />;
}
