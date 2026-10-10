import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { createTranslator } from "@/lib/i18n";
import { getAdminLocale } from "@/lib/i18n/server";
import "./student.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Titles follow the student's chosen language, like the rest of the area.
export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(await getAdminLocale());
  return {
    title: {
      absolute: `${t("Student area")} | CyberValue`,
      template: "%s | CyberValue",
    },
    description: t("Private learning area for invited students."),
    robots: { index: false, follow: false },
  };
}
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// Its own root layout: the private area follows the language cookie (like
// /admin) and uses the student design instead of the public site chrome.
export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getAdminLocale();
  const t = createTranslator(locale);
  return (
    <html lang={locale}>
      <body className="student-root">
        <LocaleProvider locale={locale}>
          <a href="#student-main" className="student-skip">
            {t("Skip to content")}
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
