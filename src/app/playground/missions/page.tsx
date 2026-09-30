import { MissionControl } from "@/components/playground/missions/MissionControl";
import { metadata } from "@/lib/seo";
import { ContentLanguage } from "@/components/content-language";

export const generateMetadata = () =>
  metadata(
    "Security Missions",
    "Investigate access control, checkout logic, and webhook replay in three interactive cases. Build requests, gather evidence, engineer defenses, and run regression checks.",
    "/playground/missions",
  );

export default function MissionsPage() {
  return (
    <ContentLanguage language="en">
      <MissionControl />
    </ContentLanguage>
  );
}
