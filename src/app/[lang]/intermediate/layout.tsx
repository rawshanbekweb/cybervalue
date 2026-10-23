import { LabMessages } from "@/components/i18n/lab-messages";

// The Intermediate labs read the same lab dictionaries as the Academy.
export default function IntermediateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LabMessages>{children}</LabMessages>;
}
