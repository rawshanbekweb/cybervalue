import { LabMessages } from "@/components/i18n/lab-messages";

// Every lab page's interactive part reads the lab dictionaries; the rest of
// the site does not load them.
export default function AcademyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LabMessages>{children}</LabMessages>;
}
