import { JuniorAcademy } from "@/components/playground/junior/JuniorAcademy";
import { JuniorLogin } from "@/components/playground/junior/JuniorLogin";
import { AcademyShell } from "@/components/playground/junior/AcademyShell";
import { getJuniorMember } from "@/lib/junior/session";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Cybervalue Academy Junior",
    "A first step into cybersecurity for beginners: missions, a story case, a cipher room, homework and ranks. Members sign in with the access code from their teacher.",
    "/junior",
  );

export default async function JuniorPage() {
  if (!(await getJuniorMember())) return <JuniorLogin />;
  return (
    <AcademyShell>
      <JuniorAcademy />
    </AcademyShell>
  );
}
