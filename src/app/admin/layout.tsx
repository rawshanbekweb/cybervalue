import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { SiteShell } from "@/components/site-shell";
import { localeCookie, resolveLocale } from "@/lib/i18n";
import "../globals.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: { absolute: "Admin | CyberValue" },
  description: "Private administration area.",
  robots: { index: false, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#101211",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = resolveLocale((await cookies()).get(localeCookie)?.value);
  return (
    <SiteShell locale={locale}>
      <div className="admin-root">{children}</div>
    </SiteShell>
  );
}
