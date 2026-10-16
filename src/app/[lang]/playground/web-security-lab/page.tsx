import { requireSection } from "@/lib/site-config-server";
import { SecurityLab } from "@/components/playground/security-lab/SecurityLab";
import { MissionGateway } from "@/components/mission-gateway";
import { metadata as buildMetadata } from "@/lib/seo";

export const generateMetadata = () =>
  buildMetadata(
    "Web Security Lab",
    "An interactive 36-lesson Web Application Security lab: real HTTP requests, and hands-on demos of SQLi, XSS, and IDOR.",
    "/playground/web-security-lab",
  );

export default async function WebSecurityLabPage() {
  await requireSection("academy", "security");
  return (
    <>
      <div className="container" style={{ paddingTop: 28 }}>
        <MissionGateway />
      </div>
      <SecurityLab />
    </>
  );
}
