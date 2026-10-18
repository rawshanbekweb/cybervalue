import { requireSection } from "@/lib/site-config-server";

export default async function KidsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSection("kids");
  return children;
}
