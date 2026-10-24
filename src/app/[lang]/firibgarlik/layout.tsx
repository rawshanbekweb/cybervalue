import { LabMessages } from "@/components/i18n/lab-messages";

// The simulator is built on the lab layout and reads the lab dictionaries.
export default function ScamsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LabMessages>{children}</LabMessages>;
}
