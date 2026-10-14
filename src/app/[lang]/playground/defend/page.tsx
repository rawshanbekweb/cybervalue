import { DefendLab } from "@/components/playground/defend/DefendLab";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Build & Defend",
    "Write rendering code, then survive an attacker bot that fires real XSS, URL and open-redirect payloads at it in an isolated sandbox.",
    "/playground/defend",
  );

export default function DefendPage() {
  return <DefendLab />;
}
