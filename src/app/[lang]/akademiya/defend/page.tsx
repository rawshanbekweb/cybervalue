import { requireSection } from "@/lib/site-config-server";
import { DefendLab } from "@/components/playground/defend/DefendLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Build & Defend",
    "Write rendering code, then survive an attacker bot that fires real XSS, URL and open-redirect payloads at it in an isolated sandbox.",
    "/akademiya/defend",
  );

export default async function DefendPage() {
  await requireSection("academy", "defend");
  return <DefendLab />;
}
