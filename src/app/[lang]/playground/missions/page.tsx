import { requireSection } from "@/lib/site-config-server";
import { MissionControl } from "@/components/playground/missions/MissionControl";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Security Missions",
    "Investigate access control, checkout logic, and webhook replay in three interactive cases. Build requests, gather evidence, engineer defenses, and run regression checks.",
    "/playground/missions",
  );

export default async function MissionsPage() {
  await requireSection("academy", "missions");
  return <MissionControl />;
}
