import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { SiteShell } from "@/components/site-shell";
import { localeCookie, resolveLocale } from "@/lib/i18n";
import "../globals.css";
import { AdminMessages } from "@/components/i18n/admin-messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: { absolute: "Teacher | Cybervalue" },
  description: "Private teaching area.",
  robots: { index: false, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = resolveLocale((await cookies()).get(localeCookie)?.value);
  return (
    <SiteShell locale={locale}>
      <AdminMessages>
        <div className="admin-root">{children}</div>
      </AdminMessages>
    </SiteShell>
  );
}
