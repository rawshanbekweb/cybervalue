import { requireSection } from "@/lib/site-config-server";
import { KidsMessages } from "@/components/i18n/kids-messages";

export default async function KidsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSection("kids");
  return <KidsMessages>{children}</KidsMessages>;
}
