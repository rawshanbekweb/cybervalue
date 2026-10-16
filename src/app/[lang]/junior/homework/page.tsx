import { HomeworkPage } from "@/components/playground/junior/HomeworkPage";
import { JuniorLogin } from "@/components/playground/junior/JuniorLogin";
import { AcademyShell } from "@/components/playground/junior/AcademyShell";
import { getJuniorMember } from "@/lib/junior/session";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Junior homework",
    "The daily puzzle, cipher exercises and a printable homework sheet for Cybervalue Academy Junior members.",
    "/junior/homework",
    true,
  );

export default async function JuniorHomeworkPage() {
  if (!(await getJuniorMember())) return <JuniorLogin />;
  return (
    <AcademyShell>
      <HomeworkPage />
    </AcademyShell>
  );
}
